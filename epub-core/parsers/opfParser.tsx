import cheerio from "react-native-cheerio";
import { Metadata, OPFData, Spine } from "../types"

export async function parseOPF(opfXml: string): Promise<OPFData> {
  const $ = cheerio.load(opfXml, { xmlMode: true });

  // Extract metadata
  const extractedMetadata: Metadata = {
    title: $("metadata > dc\\:title").text() || "",
    language: $("metadata > dc\\:language").text() || "",
    date: $("metadata > dc\\:date").text() || "",
    creator: $("metadata > dc\\:creator").text() || "",
    identifier: $("metadata > dc\\:identifier").text() || "",
    contributor: $("metadata > dc\\:contributor").text() || undefined,
    coverImage: $("metadata > meta[name='cover']").attr("content") || undefined,

  };

  // Convert manifest to a lookup table
  const manifestMap: Record<string, { id: string; href: string }> = {};
  $("manifest > item").each((_: any, el: any) => {
    const id = $(el).attr("id");
    const href = $(el).attr("href");
    if (id && href) {
      manifestMap[id] = { id, href };
    }
  });

  // Extract chapters in the order defined by <spine>
  const spine: Spine[] = $("spine > itemref")
    .map((_: any, el: any) => {
      const idref = $(el).attr("idref") || "";
      return manifestMap[idref] || null;
    })
    .get()
    .filter((chapter: any) => chapter !== null);


  return { metadata: extractedMetadata, spine };
}
