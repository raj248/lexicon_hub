import * as FileSystem from "expo-file-system";
import cheerio from "react-native-cheerio";
import { readFileFromZip } from "~/modules/FileUtil";

const CACHE_DIR = `${FileSystem.cacheDirectory}epub_resources/`;

export async function extractAndRewriteImages(htmlContent: string, resources: Record<string, string>): Promise<string> {
  // Use Cheerio for proper HTML parsing
  const $ = cheerio.load(htmlContent);

  // Replace <img src="...">
  $("img").each((_: any, el: any) => {
    const src = $(el).attr("src");
    if (src && resources[src]) {
      const extension = src.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = extension === "png" ? "image/png" :
                       extension === "jpg" || extension === "jpeg" ? "image/jpeg" :
                       "application/octet-stream";

      $(el).attr("src", `data:${mimeType};base64,${resources[src]}`);
    }
  });

  // Replace <svg><image xlink:href="...">
  $("svg image").each((_: any, el: any) => {
    const src = $(el).attr("href") || "";
    console.log("src: ", Object.keys(resources))
    if (src && resources[src]) {
      const extension = src.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = extension === "png" ? "image/png" :
                       extension === "jpg" || extension === "jpeg" ? "image/jpeg" :
                       "application/octet-stream";
      $(el).attr("href", `data:${mimeType};base64,${resources[src]}`);
      $(el).removeAttr("xlink:href"); // Remove deprecated attribute
    }
  });

  return $.html();
}


export async function extractResourceBase64(
  zipPath: string,
  content: string
): Promise<Record<string, string>> {
  const $ = cheerio.load(content);

  // Extract all relevant resource paths
  const resourcePaths = $("img, link, script, svg image")
  .map((_: any, el: any) => $(el).attr("src") || $(el).attr("href") || $(el).attr("xlink:href") || "")
  .get();

  console.log("Resource paths: ",resourcePaths)
  const resourceBase64Map: Record<string, string> = {};

  // Read each file from the ZIP and encode it in Base64
  for (const path of resourcePaths) {
    const newPath:string = path.replace("..", "OEBPS")
    console.log("path: ", path, "newPath: ", newPath)
    const base64Data = await readFileFromZip(zipPath, newPath, "base64");
    if (base64Data) {
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