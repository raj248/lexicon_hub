import { useBookStore } from "~/stores/bookStore"; // Adjust import as needed
import * as EpubKit from "~/modules/epub-kit"; // Ensure correct import

export default async function processChapter(bookId: string): Promise<string | null> {
  try {
    const book = await useBookStore.getState().getBook(bookId);
    if (!book) return null;

    const chapters = book.chapters;
    console.log(chapters)
    const chapter = await EpubKit.getChapter(book.path || "", chapters ? chapters[0].paths : "");
    console.log(chapter)

    if (!chapter) {
      console.log("Chapter not found.");
      return null
    }

    function replaceOEBPS(filePath: string): string {
      return filePath.replace(/^OEBPS\//, "../");
    }
    function restoreOEBPS(filePath: string): string {
      return filePath.replace(/^\.\.\//, "OEBPS/");
    }

    function injectBase64Images(htmlContent: string, resources: Record<string, string>): string {
      return htmlContent.replace(/<img [^>]*src=["']([^"']+)["'][^>]*>/g, (match, src) => {
        const normalizedSrc = restoreOEBPS(src);
        console.log(normalizedSrc)
        if (resources[normalizedSrc]) {
          console.log("found")
          const base64Data = resources[normalizedSrc];
          const mimeType = normalizedSrc.endsWith(".png") ? "image/png" : "image/jpeg"; // Adjust as needed
          return match.replace(src, `data:${mimeType};base64,${base64Data}`);
        }
        return match; // If no match, keep the original
      });
    }

    // Inject CSS styles
    let styledContent = chapter.content.replace(
      "</head>",
      `<style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.8; 
          color: #333; 
          margin: 20px; 
          padding: 20px; 
          font-size: 18px; 
        }
        h1 { 
          color: #444; 
          text-align: center; 
          font-size: 24px; 
        }
        p { 
          margin: 12px 0; 
          font-size: 20px; 
        }
        .centerp { 
          text-align: center; 
          font-weight: bold; 
          font-size: 18px; 
        }
        img { 
          display: block; 
          max-width: 100%; 
          height: auto; 
          margin: 10px auto; 
          padding: 10px; 
          border-radius: 30px;
        }
      </style></head>`
    );


    // Inject Base64 images
    styledContent = injectBase64Images(styledContent, chapter.resources);

    return styledContent;
  } catch (error) {
    console.error("Error processing chapter:", error);
    return null;
  }
}
