import { NativeModule, requireNativeModule } from 'expo';


declare class EpubKitModule extends NativeModule {
  getTheme(): string;
  requestStoragePermission(): Promise<boolean>;
  scanFiles(): Promise<string[]>;
  extractMetadata(filePath:string): Promise<any>
  getChapter(epubFilePath: String, chapterPath: String): Promise<string>
}

// This call loads the native module object from the JSI.
export default requireNativeModule<EpubKitModule>('EpubKit');
