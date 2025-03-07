import * as FileSystem from 'expo-file-system';
import { useBookStore } from '~/store/bookStore';

async function scanDirectoryRecursively(directoryUri: string): Promise<string[]> {
  try {
    const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
    let epubFiles: string[] = [];

    for (const fileUri of files) {
      console.log("Scanning:", fileUri);

      if (fileUri.endsWith('.epub')) {
        epubFiles.push(fileUri);
      } else {
        try {
          // Check if it's a file by attempting to open it
          console.log(await FileSystem.StorageAccessFramework.readDirectoryAsync(fileUri));
          // console.log(`Skipping (it's a file): ${fileUri}`);
        } catch (error) {
          // If openDocumentAsync fails, it's likely a directory → Recursively scan it
          console.log(`Recursing into directory: ${fileUri}`);
          const subdirectoryEpubs = await scanDirectoryRecursively(fileUri);
          epubFiles = epubFiles.concat(subdirectoryEpubs);
        }
      }
    }

    return epubFiles;
  } catch (error) {
    console.error(`Error scanning directory (${directoryUri}):`, error);
    return [];
  }
}

export async function scanEpubFiles() {
  try {
    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permission.granted) {
      console.log('Directory access permission denied');
      return;
    }
    const directoryUri = permission.directoryUri;
    console.log('Selected Directory URI:', directoryUri);

    const epubFiles = await scanDirectoryRecursively(directoryUri);
    console.log('Found EPUBs:', epubFiles);

    if (epubFiles.length === 0) {
      console.log('No EPUB files found.');
      return;
    }

    const addBook = useBookStore.getState().addBook;
    const existingBooks = useBookStore.getState().books;

    epubFiles.forEach(filePath => {
      if (!existingBooks[filePath]) {
        addBook({
          id: filePath,
          title: filePath.split('/').pop()?.replace('.epub', '') || 'Unknown Title',
          author: 'Unknown',
          coverImage: '',
          category: 'Book',
          path: filePath,
          addedAt: Date.now(),
        });
      }
    });
  } catch (error) {
    console.error('Error scanning EPUB files:', error);
  }
}
