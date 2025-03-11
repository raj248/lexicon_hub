import * as FileSystem from "expo-file-system";
import {useImageManipulator, SaveFormat, ImageManipulator} from "expo-image-manipulator";
import EpubKit from "./src/EpubKitModule";

export function getTheme(): string {
  return EpubKit.getTheme();
}

export async function scanFiles() {
  return await EpubKit.scanFiles();
}

export async function extractMetadata(filePath: string) {
  const metadata = await EpubKit.extractMetadata(filePath);
  try {
    if (metadata.coverImage) {
      metadata.coverImage = await saveCoverImage(metadata.coverImage, metadata.title);
    }else {
      metadata.coverImage = "https://placehold.co/200x270";
    }
    
    // Rename `creator` to `author`
    if (metadata.creator) {
      metadata.author = metadata.creator;
      delete metadata.creator;
      delete metadata.cover;
    }
    
    console.log(metadata.cover)
    return metadata;
  } catch (e) {
    metadata.coverImage = undefined;
    console.error("File path is: ", filePath);
    console.error("The error is: ", e);
  }
}

export async function getChapter(epubFilePath: string, chapterPath: string) {
  return await EpubKit.getChapter(epubFilePath, chapterPath);
}

export async function requestStoragePermission() {
  return await EpubKit.requestStoragePermission();
}

// 🛠 **Helper Function: Save and Optimize Cover Image**
async function saveCoverImage(base64String: string, title: string) {
  const filename = title.replace(/\s+/g, "_") + ".jpg"; // Sanitize filename
  const path = `${FileSystem.cacheDirectory}${filename}`;
  
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  
  // Write Base64 string to file
  await FileSystem.writeAsStringAsync(path, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const context = ImageManipulator.manipulate(path);
  // Resize and compress image
  // context.resize({ height: 160 })
  try {
    const resized = await context.renderAsync()
    const image = await resized.saveAsync({
     compress: 0.1, 
     format: SaveFormat.JPEG  // Compress image
    })
    return image.uri; // Return file URI for loading in <Image />
    
  } catch (error) {
    console.error(error)
    console.error("File name: ", filename);
    console.error("base64Data.substring(0, 100): ", base64Data.substring(0, 100));
    console.error("The error is: ", error);
    return '';
  }
  

}
