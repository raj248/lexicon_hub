import React, { useEffect, useState, useTransition, useRef } from "react";
import { SafeAreaView, ScrollView, ActivityIndicator, StatusBar, View, InteractionManager } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import processChapter from "~/utils/processChapter";
import FloatingHeader from "~/components/FloatingHeader";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import ChapterListModal from "~/components/ChapterListModal";
import { Chapter, useBookStore } from "~/stores/bookStore";
import * as EpubKit from "~/modules/epub-kit";
import { usePreferencesStore } from "~/stores/preferenceStore";
import { WebView } from 'react-native-webview';

export default function ReaderScreen() {
  const [chapterContent, setChapterContent] = useState<string | null>(null);

  const navigation = useNavigation();

  const bookId = useLocalSearchParams().bookId as string;
  const [chapters, setChapters] = useState<Chapter[]>();
  const [index, setIndex] = useState<number>(12);

  const [loading, setLoading] = useState(false); // Track loading state
  const [isPending, startTransition] = useTransition();
  const latestIndex = useRef(index); // Track latest index to prevent race conditions

  const [headerVisibility, setHeaderVisibility] = useState(true)
  const [chapterListVisibility, setChapterListVisibility] = useState(false)
  const preferences = usePreferencesStore((state) => state.preferences)

  const toggleHeader = () => {
    setHeaderVisibility(!headerVisibility);
  };

  const toggleChapterList = () => {
    setChapterListVisibility(!chapterListVisibility);
    toggleHeader();
  };

  const book = useBookStore.getState().getBook(bookId);
  if (!chapters) setChapters(book?.chapters);

  useEffect(() => {
    StatusBar.setHidden(true, "fade");
    setHeaderVisibility(false);
    navigation.setOptions({ headerShown: false });
    return () => {
      StatusBar.setHidden(false, "fade");
      setHeaderVisibility(true);
    };
  }, []);

  useEffect(() => {
    setChapterContent('');
    setLoading(true); // Start loading state

    async function loadContent() {
      latestIndex.current = index; // Update latest index ref
      setLoading(true);

      // Defer heavy processing until UI is rendered
      // await InteractionManager.runAfterInteractions();
      const startTime = performance.now();

      const chapterContent = await EpubKit.getChapter(book?.path || "", chapters ? chapters[index].paths : "");
      console.log(chapterContent)
      const endTime = performance.now();
      if (latestIndex.current !== index) return; // Ignore outdated calls
      const title = chapters ? chapters[index].title : "";
      if (!chapterContent) {
        setChapterContent('');
        setLoading(false);
        return;
      }

      const content = await processChapter(chapterContent, preferences.fontSize);
      console.log(endTime - startTime)
      setChapterContent(content);
      setLoading(false);
    }

    startTransition(() => {
      loadContent();
    });
    // Defer UI updates while loading content
  }, [index, preferences]);

  const handleTap = (event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      toggleHeader();
    }
  };
  const tapStartTime = useRef(0);
  return (

    <TapGestureHandler
      onHandlerStateChange={handleTap}
      numberOfTaps={1}
      maxDurationMs={350} // Reduce tap detection delay
      shouldCancelWhenOutside={false}
      onBegan={() => {
        tapStartTime.current = performance.now(); // Capture tap start time
      }}
      onActivated={() => {
        const tapDuration = performance.now() - tapStartTime.current;
        console.log(`Tap registered in ${tapDuration.toFixed(2)} ms`);
      }}
    >
      <SafeAreaView className="flex-1 mt-4">
        {loading || isPending ? (
          <ActivityIndicator size="large" className="flex-1 justify-center" />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: chapterContent || '' }} // Ensure it's never null
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
