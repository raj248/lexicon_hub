import * as FileSystem from 'expo-file-system';
import { useBookStore } from '~/store/bookStore';

export async function scanEpubFiles() {
  try {
    // Request permission to access a directory
    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permission.granted) {
      console.log('Directory access permission denied');
      return;
    }

    const directoryUri = permission.directoryUri;
    console.log('Selected Directory URI:', directoryUri);

    // Read the contents of the selected directory
    const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
    console.log('Files in Directory:', files);

    // Filter for EPUB files
    const epubFiles = files.filter(file => file.endsWith('.epub'));
    console.log('Found EPUBs:', epubFiles);

    if (epubFiles.length === 0) {
      console.log('No EPUB files found in this directory.');
      return;
    }

    const addBook = useBookStore.getState().addBook;
    const existingBooks = useBookStore.getState().books;

    // Add EPUBs to the book store
    epubFiles.forEach(file => {
      const filePath = `${directoryUri}/${file}`;
      if (!existingBooks[filePath]) {
        addBook({
          id: filePath,
          title: file.replace('.epub', ''),
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
