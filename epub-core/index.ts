import JSZip from "jszip";
import * as FileSystem from 'expo-file-system';

import { parseOPF } from "./parsers/opfParser";
import { parseTOC } from "./parsers/tocParser";
import {processChapter} from "./processor/processChapter";
import { readFileFromZip } from "./utils/zipUtils";

import { TocEntry, Metadata, Spine } from "./types";

const OPF_PATH = "OEBPS/content.opf";
const TOC_PATH = "OEBPS/toc.ncx";

export class EPUBHandler {
  private zip: JSZip;
  private metadata: Metadata;
  private spine: Spine[];
  private toc: TocEntry[];

  constructor() {
    this.zip = new JSZip();
    this.metadata = {
      title: "",
      language: "",
      date: "",
      creator: "",
      identifier: "",
      
    };
    this.spine = [];
    this.toc = [];
  }

  async loadFile(filePath: string) {
    const fileUri = filePath.startsWith("file://") ? filePath : `file://${filePath}`;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      });
    const buffer = Uint8Array.from(atob(fileContent), (c) => c.charCodeAt(0));
    return await this.load(buffer);
  }
  

  async load(epubFile: ArrayBuffer|Uint8Array<ArrayBuffer>) {
    await this.zip.loadAsync(epubFile);
  }

  async parseEPUB() {
    // const opfPath = await findOPFFile(this.zip);

    const opfData = await readFileFromZip(this.zip, OPF_PATH);
    if (!opfData) throw new Error("OPF file not found");
    const tocData = await readFileFromZip(this.zip, TOC_PATH);
    if (!tocData) throw new Error("TOC file not found");


    const opf = await parseOPF(opfData);
    const toc = await parseTOC(tocData);

    this.metadata = opf.metadata;
    this.spine = opf.spine;
    this.toc = toc;
    return { metadata: opf.metadata, spine: opf.spine, toc: toc };
  }

  async extractChapter(chapterPath: string) {
    chapterPath = "OEBPS/" + chapterPath
    return processChapter(this.zip, chapterPath);
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
    const chapterPath = this.spine[index];
    return this.extractChapter(chapterPath.href);
  }    
}
