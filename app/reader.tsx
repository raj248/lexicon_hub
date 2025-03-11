import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import WebView from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import * as EpubKit from "~/modules/epub-kit";
import { Chapter, useBookStore } from "~/stores/bookStore";
import processChapter from "~/utils/processChapter";
import { FAB } from "react-native-paper";
import FloatingHeader from "~/components/FloatingHeader";
import SettingsPanel from "~/components/SettingsPanel";

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fabOpen, setFabOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function loadContent() {
      const styledContent = await processChapter(bookId as string);
      if (styledContent) {
        setHtmlContent(styledContent);
      }

      // Load EPUB chapters
      const epubChapters = await useBookStore.getState().getChapters(bookId as string);
      setChapters(epubChapters || []);
    }
    loadContent();
  }, [bookId]);

  return (
    <View className="flex-1">
      <FloatingHeader onSettingsPress={() => setShowSettings(!showSettings)} />
      <SettingsPanel visible={showSettings} />

      {htmlContent ? (
        <WebView source={{ html: htmlContent }} style={{ flex: 1 }} />
      ) : (
        <ActivityIndicator size="large" />
      )}

      {/* FAB Group for Chapter Selection */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? "close" : "book-open-variant"}
        actions={chapters.map((ch, index) => ({
          icon: "book",
          label: ch.title,
          onPress: () => console.log(`Go to ${ch.title}`),
        }))}
        onStateChange={({ open }) => setFabOpen(open)}
        style={{ position: "absolute", bottom: 40, right: 20 }}
      />
    </View>
  );
}
