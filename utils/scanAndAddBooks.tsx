import { useBookStore } from "~/stores/bookStore"; // Import Zustand store
import * as EpubKit from '~/modules/epub-kit';
import * as Crypto from 'expo-crypto';
import Toast from 'react-native-toast-message';

export default async function scanAndAddBooks() {
  try {
    const books = await EpubKit.scanFiles();
    console.log("Found books:", books.length);

    const existingBooks = useBookStore.getState().books; // Fetch existing books
    const existingPaths = new Set(Object.values(existingBooks).map(book => book.path)); // Store paths for quick lookup

    const batchSize = 2; // Process books in batches
    let batch = [];

    for (const bookPath of books) {
      if (existingPaths.has(bookPath)) continue; // Skip if book already exists

      const metadata = await EpubKit.extractMetadata(bookPath).catch((err) => console.log(err));
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

      const newBook = { ...metadata, path: bookPath, addedAt: Date.now(), id };
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
