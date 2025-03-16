import { Chapter, useBookStore } from "~/stores/bookStore"; // Import Zustand store
import * as EpubKit from '~/modules/epub-kit';
import { RequestStoragePermission, ScanFiles } from "~/modules/FileUtil"
import * as Crypto from 'expo-crypto';
import Toast from 'react-native-toast-message';

export default async function scanAndAddBooks() {
  try {
    const hasPermission = await RequestStoragePermission();
    console.log("Storage permission:", hasPermission);

    if (!hasPermission) {
      Toast.show({
        type: "error",
        text1: "Storage permission denied",
        text2: "Please enable storage permission in settings",
      });
      console.log("Storage permission denied");
      return;
    }

    const books = await ScanFiles();
    console.log("Found books:", books.length);

    const existingBooks = useBookStore.getState().books; // Fetch existing books
    const existingPaths = new Set(Object.values(existingBooks).map(book => book.path)); // Store paths for quick lookup

    const batchSize = 2; // Process books in batches
    let batch = [];
    console.log(books)

    for (const bookPath of books) {
      if (existingPaths.has(bookPath)) continue; // Skip if book already exists

      const metadata = await EpubKit.extractMetadata(bookPath).catch((err) => console.log(err));
      console.log(metadata)
      if (!metadata) {
        Toast.show({
          type: "error",
          text1: "Failed to open book",
          text2: bookPath,
        });
        continue;
      }

      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA1,
        metadata.title + metadata.author
      );
      const parsedChapters: Chapter[] = JSON.parse(metadata.chapters); // Convert string to array

      const transformedChapters = parsedChapters.flatMap((chapter: Chapter) => {
        if (!chapter.paths || typeof chapter.paths !== "string") {
          console.warn(`Invalid paths for chapter: ${chapter.title}`, chapter);
          return []; // Skip invalid entries
        }

        return chapter.paths.split(",").map((path: string, index: number) => ({
          title: index === 0 ? chapter.title : `${chapter.title} (Part ${index + 1})`,
          paths: path.trim(),
        }));
      });


      const newBook = {
        ...metadata,
        path: bookPath,
        addedAt: Date.now(),
        id,
        chapters: transformedChapters, // Store transformed chapters
      };
      batch.push(newBook);

      if (batch.length >= batchSize) {
        useBookStore.getState().addBooks(batch);
        batch = []; // Clear batch
        await new Promise((res) => setTimeout(res, 10)); // Small delay to allow UI updates
      }
    }

    // Add remaining books
    if (batch.length > 0) {
      useBookStore.getState().addBooks(batch);
    }

  } catch (error) {
    console.error("Error in scanAndAddBooks:", error);
  }
}
