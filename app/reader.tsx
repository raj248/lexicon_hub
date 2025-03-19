import React, { useEffect, useState, useRef, useCallback } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

import FloatingHeader from "~/components/FloatingHeader";
import ChapterListModal from "~/components/ChapterListModal";

import { EPUBHandler } from "~/epub-core";
import { injectedJS } from "~/utils/jsInjection";
import { useProgressStore } from "~/stores/progressStore";

export default function ReaderScreen() {
  const navigation = useNavigation();
  const { bookId } = useLocalSearchParams() as { bookId: string };

  const webViewRef = useRef<WebView>(null);
  const epubHandler = useRef<EPUBHandler | null>(null);
  const latestIndex = useRef<number>(12);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [index, setIndex] = useState<number>(12);
  const [headerVisibility, setHeaderVisibility] = useState(false);
  const [chapterListVisibility, setChapterListVisibility] = useState(false);

  let initialScroll = useRef(0);
  const hasInitialized = useRef(false);



  /** Toggle Header & Chapter List */
  const toggleHeader = () => {
    setHeaderVisibility((prev) => !prev);
    setChapterListVisibility(false);
  };
  const toggleChapterList = () => {
    setChapterListVisibility((prev) => !prev);
    setHeaderVisibility((prev) => !prev);
  };

  /** Set Chapter Index from TOC */
  const setChapterIndex = useCallback((i: number) => {
    const entry = epubHandler.current?.getSpineIndexFromTocIndex(i);
    if (entry !== undefined) setIndex(entry);
  }, []);

  /** Initialize EPUB */
  useEffect(() => {
    StatusBar.setHidden(true, "fade");
    navigation.setOptions({ headerShown: false });

    epubHandler.current = new EPUBHandler();
    epubHandler.current.loadFile(bookId).then(() => {
      const progress = useProgressStore.getState().getProgress(bookId);
      if (progress) {
        setIndex(progress.chapter);
        initialScroll.current = progress?.readProgress || 0;
        console.log(JSON.stringify(progress))
      } else {
        setIndex(0);
      }
      // hasInitialized.current = true;
    });

    return () => {
      StatusBar.setHidden(false, "fade");
    };
  }, []);

  /** Load Chapter Content */
  useEffect(() => {
    if (latestIndex.current === index || !epubHandler.current) return;

    setLoading(true);
    latestIndex.current = index;

    epubHandler.current
      .getChapter(index)
      .then((res) => {
        if (res) setContent(res);
        const progress = useProgressStore.getState().getProgress(bookId);
        if (progress) {
          if (progress.chapter !== index) {
            useProgressStore.getState().setProgress(bookId, { readProgress: 0, chapter: index });
            initialScroll.current = 0;
          }
          // initialScroll.current = progress?.readProgress || 0;
          console.log("scroll", progress?.readProgress, initialScroll.current)
        }

      })
      .finally(() => setLoading(false));
  }, [index]);


  const onMessage = (event: any) => {
    console.log(event.nativeEvent.data)
    if (event.nativeEvent.data === "toggleHeader") {
      toggleHeader();
    } else {
      const data = JSON.parse(event.nativeEvent.data);
      useProgressStore.getState().setProgress(bookId, { readProgress: data.value, chapter: index });
    }
  };

  return (
    <View className="flex-1">
      {loading ? (
        <ActivityIndicator size="large" className="flex-1 justify-center" />
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: content }}
          injectedJavaScript={injectedJS + `window.scrollTo(0, ${(initialScroll.current / 100)} * document.body.scrollHeight);`}
          // injectedJavaScriptBeforeContentLoaded={injectedJS}
          style={{ flex: 1 }}
          onMessage={onMessage}
          onLoadEnd={() => {
            console.log("Webview loaded");
          }}
          onLoadProgress={({ nativeEvent }) => {
            console.log("Webview loading progress: ", nativeEvent.progress);
          }}
          onLoadStart={() => {
            console.log("Webview loading started");
          }}

        />
      )}

      <FloatingHeader
        toggleChapterList={toggleChapterList} headerVisibility={headerVisibility} setHeaderVisibility={setHeaderVisibility}
      />

      <ChapterListModal
        toggleChapterList={toggleChapterList} chapterListVisibility={chapterListVisibility} toc={epubHandler.current?.getToc()} callBack={setChapterIndex}
      />
    </View>
  );
}