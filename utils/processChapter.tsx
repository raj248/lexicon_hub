import { useBookStore } from "~/stores/bookStore";
import * as EpubKit from "~/modules/epub-kit";
import React from "react";
import { decode } from "html-entities"; // For decoding HTML entities
import { Text } from "~/components/nativewindui/Text";
import { Image } from "expo-image";
export default async function processChapter(bookId: string): Promise<React.ReactNode[]> {
  try {
    const book = await useBookStore.getState().getBook(bookId);
    if (!book) return [];

    const chapters = book.chapters;
    const index = 11
    const chapter = await EpubKit.getChapter(book.path || "", chapters ? chapters[index].paths : "");
    const title = chapters ? chapters[index].title : "";

    if (!chapter) {
      console.log("Chapter not found.");
      return [];
    }

    function restoreOEBPS(filePath: string): string {
      return filePath.replace(/^\.\.\//, "OEBPS/");
    }
    function parseInlineHTML(text: string): React.ReactNode {
      // Regex for inline tags like <em>, <strong>, <b>, <i>
      const inlineRegex = /(<(em|i|strong|b)>(.*?)<\/\2>)/g;
      const parts: React.ReactNode[] = [];

      let lastIndex = 0;
      text.replace(inlineRegex, (match, fullMatch, tag, content, offset) => {
        if (offset > lastIndex) {
          parts.push(decode(text.slice(lastIndex, offset))); // Add previous text
        }

        // Style inline elements accordingly
        const styledElement =
          tag === "em" || tag === "i" ? (
            <Text key={offset} style={{ fontStyle: "italic" }}>{decode(content)}</Text>
          ) : (
            <Text key={offset} style={{ fontWeight: "bold" }}>{decode(content)}</Text>
          );

        parts.push(styledElement);
        lastIndex = offset + fullMatch.length;
        return match;
      });

      // Push remaining text
      if (lastIndex < text.length) {
        parts.push(decode(text.slice(lastIndex)));
      }

      return parts.length === 1 ? parts[0] : parts;
    }

    function parseHTML(htmlContent: string, resources: Record<string, string>): React.ReactNode[] {
      const parsedNodes: React.ReactNode[] = [];
      parsedNodes.push(
        <Text key={parsedNodes.length}
          style={{ fontSize: 24, fontWeight: "bold" }}
          className="text-center mx-4 my-4"
        >
          {title}
        </Text>
      )

      // Extract paragraphs and images
      const regex = /<p[^>]*>(.*?)<\/p>|<img [^>]*src=["']([^"']+)["'][^>]*>/g;
      let match;

      while ((match = regex.exec(htmlContent)) !== null) {
        if (match[1]) {
          // Text paragraph with inline formatting
          parsedNodes.push(
            <Text key={parsedNodes.length} style={{ fontSize: 18, marginBottom: 10 }}>
              {parseInlineHTML(match[1])}
            </Text>
          );
        } else if (match[2]) {
          // Image
          const normalizedSrc = restoreOEBPS(match[2]);
          if (resources[normalizedSrc]) {
            parsedNodes.push(
              <Image
                key={parsedNodes.length}
                source={{ uri: `data:image/jpeg;base64,${resources[normalizedSrc]}` }}
                style={{
                  width: "100%",
                  height: 200,
                  resizeMode: "contain",
                  borderRadius: 10,
                  marginVertical: 10,
                }}
              />
            );
          }
        }
      }
      return parsedNodes;
    }

    return parseHTML(chapter.content, chapter.resources);
  } catch (error) {
    console.error("Error processing chapter:", error);
    return [];
  }
}
