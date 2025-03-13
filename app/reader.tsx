import React, { useEffect, useState, useTransition, useRef } from "react";
import { SafeAreaView, ScrollView, ActivityIndicator, StatusBar, View, InteractionManager } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import processChapter from "~/utils/processChapter";
import { useRuntimeStore } from "~/stores/useRuntimeStore";
import FloatingHeader from "~/components/FloatingHeader";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import ChapterListModal from "~/components/ChapterListModal";
import { Chapter, useBookStore } from "~/stores/bookStore";
import * as EpubKit from "~/modules/epub-kit";

export default function ReaderScreen() {
  const [chapterContent, setChapterContent] = useState<React.ReactNode[] | null>(null);
  const { setHeaderVisibility, toggleHeader } = useRuntimeStore();
  const navigation = useNavigation();
  const bookId = useLocalSearchParams().bookId as string;
  const [chapters, setChapters] = useState<Chapter[]>();
  const [index, setIndex] = useState<number>(12);
  const [loading, setLoading] = useState(false); // Track loading state
  const [isPending, startTransition] = useTransition();
  const latestIndex = useRef(index); // Track latest index to prevent race conditions

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
    setChapterContent([]);
    setLoading(true); // Start loading state

    async function loadContent() {
      latestIndex.current = index; // Update latest index ref
      setLoading(true);

      // Defer heavy processing until UI is rendered
      await InteractionManager.runAfterInteractions();

      const chapterRaw = await EpubKit.getChapter(book?.path || "", chapters ? chapters[index].paths : "");

      if (latestIndex.current !== index) return; // Ignore outdated calls

      const title = chapters ? chapters[index].title : "";
      if (!chapterRaw) {
        setChapterContent([]);
        setLoading(false);
        return;
      }

      const content = await processChapter(chapterRaw, title);
      setChapterContent(content);
      setLoading(false);
    }

    startTransition(() => {
      loadContent();
    });
    // Defer UI updates while loading content
  }, [index]);

  const handleTap = (event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      toggleHeader();
    }
  };

  return (
    <TapGestureHandler
      onHandlerStateChange={handleTap}
      numberOfTaps={1}
      maxDurationMs={200} // Reduce tap detection delay
      shouldCancelWhenOutside={false}
    >
      <SafeAreaView className="flex-1 mt-4">
        {loading || isPending ? ( // Show loader when loading
          <ActivityIndicator size="large" className="flex-1 justify-center" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flex: 1 }}>{chapterContent}</View>
          </ScrollView>
        )}
        <FloatingHeader />
        <ChapterListModal currentChapters={chapters} callBack={setIndex} />
      </SafeAreaView>
    </TapGestureHandler>
  );
}
