package expo.modules.epubkit

import android.Manifest
import android.os.Build
import android.os.Environment
import android.content.pm.PackageManager
import android.provider.Settings
import android.net.Uri
import android.content.Intent
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.io.File
import java.util.zip.ZipFile
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserFactory
import java.io.InputStreamReader
import java.io.InputStream
import java.io.BufferedReader
import java.nio.charset.Charset
import android.util.Base64
import java.io.ByteArrayInputStream
import java.net.URLConnection
import android.util.Log
import java.io.BufferedInputStream
import java.io.IOException
import javax.xml.parsers.DocumentBuilderFactory
import org.w3c.dom.Element
import org.w3c.dom.Document
import com.google.gson.Gson
data class ManifestItem(val id: String, val href: String, val mediaType: String)

class EpubKitModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EpubKit")

    AsyncFunction("requestStoragePermission") { promise: Promise ->
      val activity = appContext.currentActivity ?: run {
        promise.reject("E_NO_ACTIVITY", "No current activity", null)
        return@AsyncFunction
      }

      when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
          if (Environment.isExternalStorageManager()) {
            promise.resolve(true)
          } else {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
              data = Uri.parse("package:${activity.packageName}")
            }
            activity.startActivityForResult(intent, 1)
            promise.resolve(false)
          }
        }
        ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED -> {
          promise.resolve(true)
        }
        else -> {
          activity.requestPermissions(arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE), 1)
          promise.resolve(false)
        }
      }
    }

    AsyncFunction("scanFiles") { promise: Promise ->
      val storageDir = Environment.getExternalStorageDirectory()
      val epubFiles = mutableListOf<String>()

      fun scanDirectory(directory: File) {
        directory.listFiles()?.forEach { file ->
          when {
            file.isDirectory -> scanDirectory(file)
            file.extension.equals("epub", ignoreCase = true) -> epubFiles.add(file.absolutePath)
          }
        }
      }

      scanDirectory(storageDir)
      promise.resolve(epubFiles)
    }

    AsyncFunction("extractMetadata") { filePath: String, promise: Promise ->
      try {
        val file = File(filePath)
        if (!file.exists()) {
            promise.reject("E_FILE_NOT_FOUND", "File not found: $filePath", null)
            return@AsyncFunction
        }
        if (!file.canRead()) {
            promise.reject("E_FILE_UNREADABLE", "Cannot read file: $filePath", null)
            return@AsyncFunction
        }

        val zipFile = ZipFile(filePath)
        val containerEntry = zipFile.getEntry("META-INF/container.xml")
            ?: throw Exception("container.xml not found")

        val containerStream = zipFile.getInputStream(containerEntry)
        val opfPath = parseContainerXml(containerStream) ?: throw Exception("content.opf path is null")        
        containerStream.close()
        
        val opfEntry = zipFile.getEntry(opfPath)
            ?: throw Exception("content.opf not found at path: $opfPath")

        val opfStream = zipFile.getInputStream(opfEntry)
        val (manifest, metadata) = parseOpfFile(zipFile, opfPath)
        opfStream.close()

        // val manifest = parseManifest(zipFile, opfPath)

        val coverImage = extractCoverImage(zipFile, opfPath, manifest, metadata)
        metadata["coverImage"] = coverImage?.let { formatCoverImage(it) } ?: ""

        val toc = extractTableOfContents(zipFile, manifest)
        val gson = Gson()
        val tocJson = gson.toJson(toc)  // ✅ Convert List<Map<String, String>> to JSON string
        metadata["toc"] = tocJson

        zipFile.close()
        promise.resolve(metadata)
      } catch (e: Exception) {
        promise.reject("E_PARSING_ERROR", e.localizedMessage, e)
        return@AsyncFunction
      }
    }


    AsyncFunction("getChapter") { epubFilePath: String, chapterPath: String, promise: Promise ->
    try {
        val zipFile = ZipFile(epubFilePath)
        
        // Ensure chapter path is valid
        val chapterEntry = zipFile.getEntry(chapterPath)
        if (chapterEntry == null) {
            promise.reject("E_CHAPTER_NOT_FOUND", "Chapter not found: $chapterPath", null)
            return@AsyncFunction
        }

        // Read chapter with correct encoding
        val inputStream = zipFile.getInputStream(chapterEntry)
        val reader = BufferedReader(InputStreamReader(inputStream, Charset.forName("UTF-8")))
        val content = reader.readText()
        reader.close()
        inputStream.close()
        zipFile.close()

        promise.resolve(content)
    } catch (e: Exception) {
        promise.reject("E_CHAPTER_ERROR", "Failed to extract chapter: ${e.localizedMessage}", e)
    }
}

  }


  private fun readFileFromZip(epubFilePath: String, filePath: String): String? {
    ZipFile(epubFilePath).use { zip ->
      val entry = zip.getEntry(filePath) ?: return null
      return zip.getInputStream(entry).bufferedReader().use { it.readText() }
    }
  }

  private fun parseContainerXml(inputStream: java.io.InputStream): String? {
    val factory = XmlPullParserFactory.newInstance()
    factory.isNamespaceAware = true
    val parser = factory.newPullParser()
    parser.setInput(InputStreamReader(inputStream))

    var opfPath: String? = null
    var eventType = parser.eventType
    while (eventType != XmlPullParser.END_DOCUMENT) {
      if (eventType == XmlPullParser.START_TAG && parser.name == "rootfile") {
        opfPath = parser.getAttributeValue(null, "full-path")
        break
      }
      eventType = parser.next()
    }
    return opfPath
  }



private fun parseOpfFile(zipFile: ZipFile, opfPath: String): Pair<MutableMap<String, String>, MutableMap<String, String>> {
    val manifest = mutableMapOf<String, String>()
    val metadata = mutableMapOf<String, String>()

    val opfEntry = zipFile.getEntry(opfPath)
    if (opfEntry == null) {
        Log.e("EpubKitModule", "OPF file not found at $opfPath")
        return Pair(mutableMapOf(), mutableMapOf())
    }

    try {
        zipFile.getInputStream(opfEntry).use { inputStream ->
            val document = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(inputStream)
            document.documentElement.normalize()

            // Extract <metadata> elements
            val metadataNodes = document.getElementsByTagName("metadata").item(0) as? Element
            if (metadataNodes != null) {
                extractDublinCoreMetadata(metadataNodes, metadata)
                extractMetaTags(metadataNodes, metadata)
            }

            // Extract <manifest> elements
            val manifestNodes = document.getElementsByTagName("item")
            for (i in 0 until manifestNodes.length) {
                val node = manifestNodes.item(i) as? Element
                val id = node?.getAttribute("id") ?: continue
                val href = node.getAttribute("href") ?: continue
                manifest[id] = href
            }
        }
        Log.d("EpubKitModule", "Metadata: $metadata")
    } catch (e: Exception) {
        Log.e("EpubKitModule", "Error parsing OPF file: ${e.message}", e)
    }

    return Pair(manifest, metadata)
}

/**
 * Extracts Dublin Core metadata (dc:title, dc:creator, etc.)
 */
private fun extractDublinCoreMetadata(metadataElement: Element, metadata: MutableMap<String, String>) {
    val dublinCoreTags = mapOf(
        "title" to "dc:title",
        "creator" to "dc:creator",
        "language" to "dc:language",
        "publisher" to "dc:publisher",
        "subject" to "dc:subject",
        "description" to "dc:description"
    )

    for ((key, tagName) in dublinCoreTags) {
        val nodes = metadataElement.getElementsByTagName(tagName)
        if (nodes.length > 0) {
            metadata[key] = nodes.item(0).textContent.trim()
        }
    }
}

/**
 * Extracts <meta> tags inside <metadata>
 */
private fun extractMetaTags(metadataElement: Element, metadata: MutableMap<String, String>) {
    val metaNodes = metadataElement.getElementsByTagName("meta")
    for (i in 0 until metaNodes.length) {
        val node = metaNodes.item(i) as? Element
        val name = node?.getAttribute("name") ?: continue
        val content = node.getAttribute("content") ?: continue
        metadata[name] = content
    }
}



private fun extractCoverImage(zipFile: ZipFile, opfPath: String, manifest: Map<String, String>, meta: Map<String, String>): ByteArray? {
    var coverPath: String? = null

    // 1️⃣ Check <meta> first (direct path)
    val metaCover = meta["cover"]
    if (metaCover != null && isImageFile(metaCover)) {
        coverPath = metaCover
        Log.d("EpubKitModule", "Cover found in <meta>: $coverPath")
    }

    // 2️⃣ If <meta> has an ID (not a direct path), check <manifest>
    if (coverPath == null) {
        val coverId = metaCover ?: manifest["cover"]
        if (coverId != null) {
            coverPath = manifest[coverId] ?: coverId // Use ID to find path
            Log.d("EpubKitModule", "Cover found in <manifest>: $coverPath")
        }
    }

    if (coverPath == null || !isImageFile(coverPath)) {
        Log.e("EpubKitModule", "No valid cover image found.")
        return null
    }

    val fixedCoverPath = resolvePath(zipFile, opfPath, coverPath) // Resolve relative path
    Log.d("EpubKitModule", "Resolved Cover Path: $fixedCoverPath")

    val coverEntry = zipFile.getEntry(fixedCoverPath)
    if (coverEntry == null) {
        Log.e("EpubKitModule", "Cover image entry not found in ZIP")
        return null
    }

    return try {
        zipFile.getInputStream(coverEntry).use { inputStream ->
            BufferedInputStream(inputStream).readBytes().also {
                Log.d("EpubKitModule", "Extracted cover image size: ${it.size} bytes")
            }
        }
    } catch (e: IOException) {
        Log.e("EpubKitModule", "Error extracting cover image: ${e.message}", e)
        null
    }
}

// ✅ Helper function to check if a file is an image
private fun isImageFile(filePath: String): Boolean {
    return filePath.lowercase().matches(""".*\.(jpg|jpeg|png|gif|webp)$""".toRegex())
}


private fun resolvePath(zipFile: ZipFile, opfPath: String, relativeCoverPath: String): String? {
    val opfDir = opfPath.substringBeforeLast('/', "") // Get the base directory of content.opf

    // Check if the relative path itself exists in the ZIP
    if (zipFile.getEntry(relativeCoverPath) != null) {
        Log.d("EpubKitModule", "Resolved path: $relativeCoverPath")
        return relativeCoverPath
    }

    // Check if the file exists in the opf directory
    val directPath = "$opfDir/$relativeCoverPath"
    if (zipFile.getEntry(directPath) != null) {
        Log.d("EpubKitModule", "Resolved path: $directPath")
        return directPath
    }

    // Check if the file exists inside an "Images" directory in the opf directory
    val imagesPath = "$opfDir/Images/$relativeCoverPath"
    if (zipFile.getEntry(imagesPath) != null) {
        Log.d("EpubKitModule", "Resolved path: $imagesPath")
        return imagesPath
    }

    Log.w("EpubKitModule", "No valid path found for: $relativeCoverPath")
    return null
}






private fun parseManifest(zipFile: ZipFile, opfPath: String): Map<String, String> {
    val opfEntry = zipFile.getEntry(opfPath) ?: return emptyMap()
    val inputStream = zipFile.getInputStream(opfEntry)
    val factory = XmlPullParserFactory.newInstance()
    factory.isNamespaceAware = true
    val parser = factory.newPullParser() 
    parser.setInput(InputStreamReader(inputStream))

    val manifest = mutableMapOf<String, String>()
    var eventType = parser.eventType
    while (eventType != XmlPullParser.END_DOCUMENT) {
        if (eventType == XmlPullParser.START_TAG && parser.name == "item") {
            val id = parser.getAttributeValue(null, "id")
            val href = parser.getAttributeValue(null, "href")
            if (id != null && href != null) {
                manifest[id] = href
            }
        }
        eventType = parser.next()
    }
    return manifest
}


private fun extractTableOfContents(zipFile: ZipFile, manifest: Map<String, String>): List<Map<String, String>> {
    val tocPath = manifest["ncx"] ?: manifest["nav"] ?: return emptyList()
    
    Log.d("EpubKitModule", "Looking for TOC file at: $tocPath")  

    // Normalize path (EPUB files use relative paths inside /OEBPS/)
    val normalizedPath = if (zipFile.getEntry(tocPath) != null) tocPath else "OEBPS/$tocPath"
    
    val tocEntry = zipFile.getEntry(normalizedPath) ?: return emptyList<Map<String, String>>().also {
        Log.e("EpubKitModule", "TOC file not found in EPUB: $normalizedPath")
    }
    
    val inputStream = zipFile.getInputStream(tocEntry)

    return if (normalizedPath.endsWith(".ncx")) {
        parseNcxToc(inputStream)
    } else {
        parseNavToc(inputStream)
    }
}



private fun parseNcxToc(inputStream: InputStream): List<Map<String, String>> {
    val parser = XmlPullParserFactory.newInstance().newPullParser()
    parser.setInput(InputStreamReader(inputStream))

    val toc = mutableListOf<Map<String, String>>()
    var title: String? = null
    var href: String? = null

    var eventType = parser.eventType
    while (eventType != XmlPullParser.END_DOCUMENT) {
        when (eventType) {
            XmlPullParser.START_TAG -> {
                when (parser.name) {
                    "navLabel" -> title = extractText(parser) // Fix: Extract text safely
                    "content" -> {
                        href = parser.getAttributeValue(null, "src")?.trim()
                    }
                }
            }
            XmlPullParser.END_TAG -> {
                if (parser.name == "navPoint" && title != null && href != null) {
                    toc.add(mapOf("title" to title, "href" to href))
                    // Log.d("EpubKitModule", "Added TOC Entry: Title=$title, Href=$href")
                    title = null
                    href = null
                }
            }
        }
        eventType = parser.next()
    }
    return toc
}

// **Helper Function to Extract Text Safely**
private fun extractText(parser: XmlPullParser): String {
    var text = ""
    var eventType = parser.next()
    while (eventType != XmlPullParser.END_TAG || parser.name != "navLabel") {
        if (eventType == XmlPullParser.TEXT) {
            text += parser.text.trim()
        }
        eventType = parser.next()
    }
    return text
}



private fun parseNavToc(inputStream: InputStream): List<Map<String, String>> {
    val parser = XmlPullParserFactory.newInstance().newPullParser()
    parser.setInput(InputStreamReader(inputStream))

    val toc = mutableListOf<Map<String, String>>()
    var title: String? = null
    var href: String? = null

    var eventType = parser.eventType
    while (eventType != XmlPullParser.END_DOCUMENT) {
        when (eventType) {
            XmlPullParser.START_TAG -> {
                if (parser.name == "a") {
                    href = parser.getAttributeValue(null, "href")?.trim()
                    title = extractText(parser) // Fix: Extract text properly
                    // Log.d("EpubKitModule", "Found NAV TOC entry: Title=$title, Href=$href")
                }
            }
            XmlPullParser.END_TAG -> {
                if (parser.name == "a" && title != null && href != null) {
                    toc.add(mapOf("title" to title, "href" to href))
                    title = null
                    href = null
                }
            }
        }
        eventType = parser.next()
    }
    return toc
}


private fun formatCoverImage(imageData: ByteArray): String {
    ByteArrayInputStream(imageData).use { stream ->
        val mimeType = URLConnection.guessContentTypeFromStream(stream) ?: "image/jpeg" // Change default if needed
        val base64Image = Base64.encodeToString(imageData, Base64.DEFAULT)
        return "data:$mimeType;base64,$base64Image"
    }
}


}
