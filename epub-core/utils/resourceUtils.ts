import * as FileSystem from "expo-file-system";
import JSZip from "jszip";
import cheerio from "react-native-cheerio";

const CACHE_DIR = `${FileSystem.cacheDirectory}epub_resources/`;

export async function extractAndRewriteImages(htmlContent: string, resources: Record<string, string>): Promise<string> {
  const matches = [...htmlContent.matchAll(/<img [^>]*src=["']([^"']+)["'][^>]*>/g)];

  const updatedHtmlParts = await Promise.all(
    matches.map(async ([match, src]) => {
      const resourceData = resources[src];

      if (resourceData) {
        const extension = src.split(".").pop();
        const mimeType = extension === "png" ? "image/png" :
                         extension === "jpg" || extension === "jpeg" ? "image/jpeg" :
                         "application/octet-stream";

        // Write the resource to the cache folder
        const filePath = `${CACHE_DIR}${Date.now()}.${extension}`;
        await FileSystem.writeAsStringAsync(filePath, resourceData, { encoding: FileSystem.EncodingType.Base64 });

        return match.replace(src, filePath);
      }

      return match;
    })
  );

  return htmlContent.replace(/<img [^>]*src=["']([^"']+)["'][^>]*>/g, () => updatedHtmlParts.shift()!);
}

export async function extractResourceBase64(
  zip: JSZip,
  content: string
): Promise<Record<string, string>> {
  const $ = cheerio.load(content);

  // Extract all relevant resource paths
  const resourcePaths = $("img, link, script")
    .map((_: any, el: any) => $(el).attr("src") || $(el).attr("href") || "")
    .get();
  console.log("Resource paths: ",resourcePaths)
  const resourceBase64Map: Record<string, string> = {};

  // Read each file from the ZIP and encode it in Base64
  for (const path of resourcePaths) {
    const newPath = path.replace("..", "OEBPS")
    const file = zip.file(newPath);
    if (file) {
      const base64Data = await file.async("base64");
      // path.replace("OEBPS", "..")
      resourceBase64Map[path] = base64Data;
    }
  }
  return resourceBase64Map;
}

export async function clearCacheFolder(folderPath: string) {
  const files = await FileSystem.readDirectoryAsync(folderPath);
  for (const file of files) {
    await FileSystem.deleteAsync(`${folderPath}${file}`);
  }
}
