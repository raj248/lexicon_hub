import * as FileSystem from "expo-file-system";
import { clearCacheFolder, extractAndRewriteImages, extractResourceBase64 } from "../utils/resourceUtils";
import { injectStyles } from "../utils/styleUtils";
import JSZip from "jszip";

const CACHE_DIR = `${FileSystem.cacheDirectory}epub_resources/`;

export async function processChapter(zip:JSZip, path: string): Promise<string | null> {
  try {
    console.log("Path to chapter: ",path)
    const chapter = await zip.file(path)?.async("string");
    if (!chapter) {
      console.log("Chapter not found.");
      return null;
    }

    // Ensure the cache directory exists
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

    // Clear the cache folder before extracting new resources
    await clearCacheFolder(CACHE_DIR);

    // Extract resources and update paths in HTML
    const resources = await extractResourceBase64(zip, chapter);

    // Rewrite images in HTML
    let processedHtml = await extractAndRewriteImages(chapter, resources);

    // Inject custom CSS
    processedHtml = injectStyles(processedHtml);

    return processedHtml;
  } catch (error) {
    console.error("Error processing chapter:", error);
    return null;
  }
}
