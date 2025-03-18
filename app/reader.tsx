import React, { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView, ActivityIndicator, StatusBar, View } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { WebView } from 'react-native-webview';

import FloatingHeader from "~/components/FloatingHeader";
import ChapterListModal from "~/components/ChapterListModal";

import { EPUBHandler } from "~/epub-core";
import { injectedJS } from "~/utils/jsInjection";

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

  const toggleHeader = () => {
    setHeaderVisibility(!headerVisibility);
    setChapterListVisibility(false);
  }
  const toggleChapterList = () => { setChapterListVisibility(!chapterListVisibility); setHeaderVisibility(!headerVisibility); };


  const epubHandler = useRef<EPUBHandler | null>(null);
  // init
  useEffect(() => {
    StatusBar.setHidden(true, "fade");
    setHeaderVisibility(false);
    navigation.setOptions({ headerShown: false });

    epubHandler.current = new EPUBHandler();
    epubHandler.current.loadFile(bookId).then(() => {
      setIndex(10);
    });
    return () => {
      StatusBar.setHidden(false, "fade");
      setHeaderVisibility(true);
    };
  }, []);
  // load chapter on list navigation
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

  const onMessage = (event: any) => {
    if (event.nativeEvent.data === "toggleHeader") {
      toggleHeader();;
    }
  };

  return (
    <View className="flex-1">
      {loading ? (
        <ActivityIndicator size="large" className="flex-1 justify-center" />
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: content }}
          injectedJavaScript={injectedJS}
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