import { useBookStore } from "~/stores/bookStore";
import * as EpubKit from "~/modules/epub-kit";
import React from "react";
import { decode } from "html-entities"; // For decoding HTML entities
import { Text } from "~/components/nativewindui/Text";
import { Image } from "expo-image";
import { useRuntimeStore } from "~/stores/useRuntimeStore";
import { Content } from "~/modules/epub-kit/src/EpubKitModule.Types";
export default async function processChapter(chapterRaw: Content, title: string): Promise<React.ReactNode[]> {
  try {
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
          style={{ fontSize: 24, fontWeight: "bold", marginTop: 10, marginBottom: 10 }}
          className="text-center mt-4 mb-4 pt-4 pb-4 mx-4"
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
            <Text key={parsedNodes.length}
              style={{
                fontSize: 18,
                marginTop: 10,
                marginHorizontal: 10,
                paddingTop: 0,
                paddingBottom: 0,
              }}>
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
                // className="rounded-md "
                source={{ uri: `data:image/jpeg;base64,${resources[normalizedSrc]}` }}
                style={{
                  width: "auto",
                  height: "80%",
                }}
                contentFit="contain"
              />
            );
          }
        }
      }
      return parsedNodes;
    }

    return parseHTML(chapterRaw.content, chapterRaw.resources);
  } catch (error) {
    console.error("Error processing chapter:", error);
    return [];
  }
}
