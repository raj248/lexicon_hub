import React, { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView, ActivityIndicator, StatusBar } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { WebView } from 'react-native-webview';

import FloatingHeader from "~/components/FloatingHeader";
import ChapterListModal from "~/components/ChapterListModal";

import { EPUBHandler } from "~/epub-core";

export default function ReaderScreen() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [index, setIndex] = useState<number>(12);
  const latestIndex = useRef(index);
  const setChapterIndex = useCallback((i: number) => {
    const entry = epubHandler.current?.getSpineIndexFromTocIndex(i)
    if (entry) setIndex(entry);
  }, [])

  const navigation = useNavigation();
  const bookId = useLocalSearchParams().bookId as string;


  const [headerVisibility, setHeaderVisibility] = useState(true);
  const [chapterListVisibility, setChapterListVisibility] = useState(false);

  const toggleHeader = () => setHeaderVisibility(!headerVisibility);
  const toggleChapterList = () => { setChapterListVisibility(!chapterListVisibility); toggleHeader(); };


  const epubHandler = useRef<EPUBHandler | null>(null);

  useEffect(() => {
    StatusBar.setHidden(true, "fade");
    setHeaderVisibility(false);
    navigation.setOptions({ headerShown: false });

    epubHandler.current = new EPUBHandler();

    epubHandler.current.loadFile(bookId).then(() => {
      setIndex(0);
    });
    return () => {
      StatusBar.setHidden(false, "fade");
      setHeaderVisibility(true);
    };
  }, []);

  useEffect(() => {
    setLoading(true);

    async function loadContent() {
      if (latestIndex.current == index) return;
      latestIndex.current = index;

      if (!epubHandler.current) return;
      await epubHandler.current.getChapter(index)
        .then((res) => {
          if (res) setContent(res)
          setLoading(false);
          return;
        }).catch(() => setLoading(false))

    }
    loadContent();
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
      maxDurationMs={150}
      shouldCancelWhenOutside={false}
    >
      <SafeAreaView className="flex-1 mt-4">
        {loading ? (
          <ActivityIndicator size="large" className="flex-1 justify-center" />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: content }}
            injectedJavaScript={`document.documentElement.style.userSelect = 'none';`}
            style={{ flex: 1 }}
          />
        )}

        <FloatingHeader
          toggleChapterList={toggleChapterList} headerVisibility={headerVisibility} setHeaderVisibility={setHeaderVisibility}
        />

        <ChapterListModal
          toggleChapterList={toggleChapterList} chapterListVisibility={chapterListVisibility} toc={epubHandler.current?.getToc()} callBack={setChapterIndex}
        />
      </SafeAreaView>
    </TapGestureHandler>
  );
}