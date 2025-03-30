import cheerio from "react-native-cheerio";
import { readFileFromZip } from "~/modules/FileUtil";
import * as FileSystem from "expo-file-system";
import { SaveFormat, ImageManipulator } from "expo-image-manipulator";


const CACHE_DIR = `${FileSystem.cacheDirectory}epub_resources/`;

export async function extractAndRewriteImages(htmlContent: string, resources: Record<string, string>): Promise<string> {
  // Use Cheerio for proper HTML parsing
  const $ = cheerio.load(htmlContent);  
  
  $("svg").each((_: any, svg: any) => {
    const img = $(svg).find("image");
    const src = img.attr("href") || img.attr("xlink:href"); // Get image source

    if (src) {
      const imgTag = `<img src="${src}" style="width: 100%; display: block;"/>`;
      $(svg).parent("div").replaceWith(imgTag); // Remove the surrounding div and keep only the image
    }
  });

  // Remove any remaining empty divs that contained the SVGs
  $("div").each((_: any, div: any) => {
    if ($(div).children().length === 0) {
      $(div).remove();
    }
  });

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
   
  return $.html();
}


export async function extractResourceBase64(
  zipPath: string,
  content: string,
  basePath: string
): Promise<Record<string, string>> {
  const $ = cheerio.load(content);

  // Extract all relevant resource paths
  const resourcePaths = $("img, link, script, svg image")
    .map((_: any, el: any) => $(el).attr("src") || $(el).attr("href") || $(el).attr("xlink:href") || "")
    .get();

  console.log("Resource paths: ", resourcePaths);
  const resourceBase64Map: Record<string, string> = {};

  // Read each file from the ZIP and encode it in Base64
  for (const path of resourcePaths) {
    const pathsToTry = [
      path.replace("..", "OEBPS"), // Adjusted path
      path,                        // Original path
      `OEBPS/${path}`, 
      basePath + path,            // Explicitly adding OEBPS prefix
    ].filter((p) => p.trim().length > 0); // Remove empty paths

    for (const tryPath of pathsToTry) {
      try {
        console.log("Trying path:", tryPath);
        const base64Data = await readFileFromZip(zipPath, tryPath, "base64");

        if (base64Data) {
          resourceBase64Map[path] = base64Data;
          break; // Stop trying if successful
        }
      } catch (error) {
        console.warn(`Failed to read: ${tryPath}, trying next...`);
      }
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

async function optimizeImage(path: string, base64Data: string) {  
    try {
      // Write Base64 string to file
      await FileSystem.writeAsStringAsync(path, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const context = ImageManipulator.manipulate(path);
  
      // Resize and compress image
      const resized = await context.renderAsync();
      const image = await resized.saveAsync({
        compress: 0.1,
        format: SaveFormat.JPEG, // Compress image
      });
  
      const imageBase64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      return imageBase64; // Return file URI for loading in <Image />
    } catch (error) {
      console.error("Error processing cover image:", error);
      return "";
    }
}
