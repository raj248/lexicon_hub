import FileUtilModule from './src/FileUtilModule';

export async function ScanFiles(): Promise<string[]> {
  return await FileUtilModule.ScanFiles();
}

export async function RequestStoragePermission(): Promise<Boolean> {
  return await FileUtilModule.RequestStoragePermission();
}
