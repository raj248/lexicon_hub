import { parseOPF } from "./parsers/opfParser";
import { parseTOC } from "./parsers/tocParser";
import {processChapter} from "./processor/processChapter";
import { readFileFromZip } from "~/modules/FileUtil";

import { TocEntry, Metadata, Spine } from "./types";
import { useBookStore } from "~/stores/bookStore";
import { findOpfPath } from "./parsers/containerParser";

const OPF_PATH = "OEBPS/content.opf";
const TOC_PATH = "OEBPS/toc.ncx";

export class EPUBHandler {
  private zipPath: string;
  private basePath: string;
  private opfPath: string | null;
  private tocPath: string;
  private metadata: Metadata;
  private spine: Spine[];
  private toc: TocEntry[];
  
  constructor() {
    this.zipPath = '';
    this.basePath = '';
    this.opfPath = '';
    this.tocPath = '';
    this.metadata = {
      title: "",
      language: "",
      date: "",
      author: "",
      identifier: "",
      
    };
    this.spine = [];
    this.toc = [];
  }

  async loadFile(filePath: string, isFilePath: true): Promise<void>;
  async loadFile(bookId: string): Promise<void>;

  async loadFile(arg: string, isFilePath: boolean = false) {
    if (!isFilePath) {
      // 
      console.log(`Fetching book from store: ${arg}`);
      const getBook = useBookStore.getState().getBook;
      const bookData = await getBook(arg); // Fetch book from store
      
      
      if (!bookData || !bookData.path) {
        throw new Error(`Book with ID ${arg} not found.`);
      }
      arg = bookData.path;
      console.log(`Book path: ${arg}`);
    }

    console.log(`File URI: ${arg}`);
    this.zipPath = arg
    await this.parseEPUB();
    return
  }
  

  async parseEPUB() {
    if (!this.zipPath) throw new Error("No file path provided");
    this.opfPath = await findOpfPath(this.zipPath);

    if (!this.opfPath) throw new Error("OPF file not found");
    this.basePath = this.opfPath.substring(0, this.opfPath.lastIndexOf('/') + 1);
    this.tocPath = this.basePath + 'toc.ncx';
    
    const opfData = await readFileFromZip(this.zipPath, this.opfPath);
    if (!opfData) throw new Error("OPF file not found");

    const tocData = await readFileFromZip(this.zipPath, this.tocPath);
    if (!tocData) throw new Error("TOC file not found");


    const opf = await parseOPF(opfData as string);
    const toc = await parseTOC(tocData as string);

    this.metadata = opf.metadata;
    this.spine = opf.spine;
    this.toc = toc;
    console.log(this.metadata)
    return { metadata: opf.metadata, spine: opf.spine, toc: toc };
  }

  async extractChapter(chapterPath: string) {
    const path = this.basePath + chapterPath;
    return processChapter(this.zipPath, path);
  }

  async getCoverImage() {
    const pathsToTry: string[] = [
      this.metadata.coverImage || "", // Ensure it's a string
      this.basePath + "Cover.jpg",
      this.basePath + "cover.jpg",
      this.basePath + "Images/Cover.jpg",
      this.basePath + (this.metadata.coverImage ? this.metadata.coverImage.split("/").pop() : "")
    ].filter((path) => path.trim().length > 0); // Remove empty strings
  
    for (const path of pathsToTry) {
      try {
        const base64Image = await readFileFromZip(this.zipPath, path, "base64");
        if (base64Image) {
          return `data:image/jpeg;base64,${base64Image}`;
        }
      } catch (error) {
        // Ignore and try the next path
      }
    }
  
    console.error("Cover image not found");
    return "";
  }
  
  async getMetadata() {
    return this.metadata;
  }
  async getSpine() {
    return this.spine;
  }
  async getToc() {
    return this.toc;
  }
  async getTocEntry(index: number) {
    if (index < 0 || index >= this.toc.length) {
      throw new Error("Invalid chapter index");
    }
    return this.toc[index];
  }
  async getChapter(index: number) {
    if (index < 0 || index >= this.spine.length) {
      throw new Error("Invalid chapter index");
    }
    const chapter = this.spine[index];
    if (!chapter.href) throw new Error("Chapter path not found in spine");
    return this.extractChapter(chapter.href);
  }    
}
