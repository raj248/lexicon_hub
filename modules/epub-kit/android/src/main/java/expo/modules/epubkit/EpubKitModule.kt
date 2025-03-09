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

    AsyncFunction("scanEpubFiles") { promise: Promise ->
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
        val containerStream = zipFile.getInputStream(containerEntry)
        val opfPath = parseContainerXml(containerStream)
        // val opfPath = "OEBPS/content.opf"

        if (opfPath != null) {
          val opfEntry = zipFile.getEntry(opfPath)
          val opfStream = zipFile.getInputStream(opfEntry)
          val metadata = parseOpfXml(opfStream)
          promise.resolve(metadata)
        } else {
          promise.reject("E_NO_OPF", "content.opf not found", null)
          return@AsyncFunction
        }
      } catch (e: Exception) {
        promise.reject("E_PARSING_ERROR", e.localizedMessage, e)
        return@AsyncFunction
      }
    }


    AsyncFunction("getEpubChapter") { epubFilePath: String, chapterPath: String, promise: Promise ->
      val chapterContent = readFileFromZip(epubFilePath, chapterPath)
      if (chapterContent != null) {
        promise.resolve(chapterContent)
      } else {
        promise.reject("E_CHAPTER_ERROR", "Failed to extract chapter", null)
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

  private fun parseOpfXml(inputStream: java.io.InputStream): Map<String, String> {
    val factory = XmlPullParserFactory.newInstance()
    factory.isNamespaceAware = true
    val parser = factory.newPullParser()
    parser.setInput(InputStreamReader(inputStream))

    val metadata = mutableMapOf<String, String>()
    var eventType = parser.eventType
    while (eventType != XmlPullParser.END_DOCUMENT) {
      if (eventType == XmlPullParser.START_TAG) {
        when (parser.name) {
          "title" -> metadata["title"] = parser.nextText()
          "creator" -> metadata["author"] = parser.nextText()
        }
      }
      eventType = parser.next()
    }
    return metadata
  }
}
