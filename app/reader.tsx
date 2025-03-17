import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, ActivityIndicator, StatusBar } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";

import FloatingHeader from "~/components/FloatingHeader";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import ChapterListModal from "~/components/ChapterListModal";
import { Chapter, useBookStore } from "~/stores/bookStore";
import { usePreferencesStore } from "~/stores/preferenceStore";
import { WebView } from 'react-native-webview';
import { EPUBHandler } from "~/epub-core";

export default function ReaderScreen() {
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const bookId = useLocalSearchParams().bookId as string;
  const [chapters, setChapters] = useState<Chapter[]>();
  const [index, setIndex] = useState<number>(12);
  const latestIndex = useRef(index);

  const [headerVisibility, setHeaderVisibility] = useState(true);
  const [chapterListVisibility, setChapterListVisibility] = useState(false);
  const preferences = usePreferencesStore((state) => state.preferences);

  const toggleHeader = () => setHeaderVisibility(!headerVisibility);
  const toggleChapterList = () => {
    setChapterListVisibility(!chapterListVisibility);
    toggleHeader();
  };

  const book = useBookStore.getState().getBook(bookId);
  if (!chapters) setChapters(book?.chapters);

  const epubHandler = useRef<EPUBHandler | null>(null);

  useEffect(() => {
    StatusBar.setHidden(true, "fade");
    setHeaderVisibility(false);
    navigation.setOptions({ headerShown: false });

    epubHandler.current = new EPUBHandler(book?.path || "");
    return () => {
      StatusBar.setHidden(false, "fade");
      setHeaderVisibility(true);
    };
  }, []);

  useEffect(() => {
    setChapterContent('');
    setLoading(true);

    async function loadContent() {
      latestIndex.current = index;
      setLoading(true);

      if (!epubHandler.current) return;
      const chapterPath = chapters ? chapters[index].paths : "";
      const rawContent = await epubHandler.current.getChapter(chapterPath);
      if (latestIndex.current !== index) return;

      if (!rawContent) {
        setChapterContent('');
        setLoading(false);
        return;
      }

      const processedContent = await epubHandler.current.processChapter(rawContent, preferences.fontSize);
      setChapterContent(processedContent);
      setLoading(false);
    }
    loadContent();
  }, [index, preferences]);

  const handleTap = (event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      toggleHeader();
    }
  };

  return (
    <TapGestureHandler
      onHandlerStateChange={handleTap}
      numberOfTaps={1}
      maxDurationMs={150}
      shouldCancelWhenOutside={false}
    >
      <SafeAreaView className="flex-1 mt-4">
        {loading ? (
          <ActivityIndicator size="large" className="flex-1 justify-center" />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: chapterContent || '' }}
            injectedJavaScript={`document.documentElement.style.userSelect = 'none';`}
            style={{ flex: 1 }}
          />
        )}

        <FloatingHeader
          toggleChapterList={toggleChapterList} headerVisibility={headerVisibility} setHeaderVisibility={setHeaderVisibility}
        />

        <ChapterListModal
          toggleChapterList={toggleChapterList} chapterListVisibility={chapterListVisibility} currentChapters={chapters} callBack={setIndex}
        />
      </SafeAreaView>
    </TapGestureHandler>
  );
}
