import JSZip from "jszip";

export async function readFileFromZip(zip:JSZip, path:string){
  return await zip.file(path)?.async("string");
}

