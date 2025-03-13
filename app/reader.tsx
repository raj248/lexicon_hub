import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, ActivityIndicator, StatusBar } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import processChapter from "~/utils/processChapter";
import { useRuntimeStore } from "~/stores/useRuntimeStore";
import FloatingHeader from "~/components/FloatingHeader";
import { TapGestureHandler, State } from "react-native-gesture-handler";

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams();
  const [chapterContent, setChapterContent] = useState<React.ReactNode[] | null>(null);
  const { setHeaderVisibility, toggleHeader } = useRuntimeStore();
  const navigation = useNavigation();

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
    async function loadContent() {
      const content = await processChapter(bookId as string);
      setChapterContent(content);
    }
    loadContent();
  }, [bookId]);

  const handleTap = (event: { nativeEvent: { state: number } }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      toggleHeader();
    }
  };

  return (
    <TapGestureHandler onHandlerStateChange={handleTap} numberOfTaps={1}>
      <SafeAreaView className="flex-1 p-4 m-2">
        {chapterContent ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            {chapterContent}
          </ScrollView>
        ) : (
          <ActivityIndicator size="large" className="flex-1 justify-center" />
        )}
        <FloatingHeader />
      </SafeAreaView>
    </TapGestureHandler>
  );
}
