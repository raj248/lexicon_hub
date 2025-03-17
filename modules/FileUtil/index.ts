import FileUtilModule from './src/FileUtilModule';
import { SaveFormat, ImageManipulator } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export async function ScanFiles(): Promise<string[]> {
  return await FileUtilModule.ScanFiles();
}

export async function RequestStoragePermission(): Promise<Boolean> {
  return await FileUtilModule.RequestStoragePermission();
}

export async function readFileFromZip(filePath: string, fileName: string, type: "string" | "base64" = "string"): Promise<string> {
  return await FileUtilModule.readFileFromZip(filePath, fileName, type)
  .then((result) => {
    return result;
  })
  .catch((error) => {
    console.error("Error reading file from zip:", error);
    return "";
  });
}

export async function saveCoverImage(base64String: string, title: string): Promise<string> {
  const filename = title.replace(/\s+/g, "_") + ".jpg"; // Sanitize filename
  const path = `${FileSystem.cacheDirectory}${filename}`;

  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

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

    return image.uri; // Return file URI for loading in <Image />
  } catch (error) {
    console.error("Error processing cover image:", error);
    return "";
  }
}