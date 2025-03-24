import React, { useEffect, useState, useRef, useCallback } from "react";
import { ActivityIndicator, Dimensions, StatusBar, View } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

import FloatingHeader from "~/components/FloatingHeader";
import ChapterListModal from "~/components/ChapterListModal";

import { EPUBHandler } from "~/epub-core";
import { injectedJS } from "~/utils/jsInjection";
import { useProgressStore } from "~/stores/progressStore";
import { usePreferencesStore } from "~/stores/preferenceStore";
import { useColorScheme } from "~/lib/useColorScheme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from "react-native-reanimated";

const { width } = Dimensions.get("window");


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
  const { colors } = useColorScheme()

  const preferences = usePreferencesStore((state) => state);
  const [webViewKey, setWebViewKey] = useState(0); // Unique key for WebView

  let initialScroll = useRef(0);

  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
    console.log(latestIndex.current)
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
            console.log("Updating Progress after chapter change")
            useProgressStore.getState().setProgress(bookId, { id: bookId, readProgress: 0, chapter: index });
            initialScroll.current = 0;
          }
          // initialScroll.current = progress?.readProgress || 0;
          console.log("scroll", progress?.readProgress, initialScroll.current)
        }

      })
      .finally(() => setLoading(false));
  }, [index]);


  const resetTranslation = () => {
    setTimeout(() => {
      translateX.value = 0;
      setLoading(false);
    }, 100); // Delay before making WebView visible again
  };


  const onMessage = (event: any) => {
    console.log(event.nativeEvent.data)
    if (event.nativeEvent.data === "toggleHeader") {
      toggleHeader();
    }
    else if (event.nativeEvent.data === "prev") {

      translateX.value = withTiming(width, { duration: 300, easing: Easing.out(Easing.cubic) }, () => {
        runOnJS(resetTranslation)();
      });
      setIndex(index - 1)
    }
    else if (event.nativeEvent.data === "next") {
      translateX.value = withTiming(-width, { duration: 300, easing: Easing.out(Easing.cubic) }, () => {
        runOnJS(resetTranslation)();
      });
      setIndex(index + 1)
    }
    else {
      const data = JSON.parse(event.nativeEvent.data);
      useProgressStore.getState().setProgress(bookId, { id: bookId, readProgress: data.value, chapter: index });
    }
  };
  // Re-render WebView when theme or fontSize changes
  useEffect(() => {
    if (!epubHandler.current) return;
    epubHandler.current
      .getChapter(index)
      .then((res) => {
        if (res) setContent(res);
        const progress = useProgressStore.getState().getProgress(bookId);
        if (progress) {
          if (progress.chapter !== index) {
            useProgressStore.getState().setProgress(bookId, { id: bookId, readProgress: 0, chapter: index });
            initialScroll.current = 0;
          }
          // initialScroll.current = progress?.readProgress || 0;
          console.log("scroll", progress?.readProgress, initialScroll.current)
        }

      })
  }, [preferences]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {!loading && (
        <Animated.View style={[{ flex: 1, backgroundColor: colors.background }, animatedStyle]}>
          <WebView
            ref={webViewRef}
            key={webViewKey}
            androidLayerType="hardware"
            originWhitelist={['*']}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: colors.background,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
            source={{ html: content }}
            injectedJavaScript={injectedJS + `window.scrollTo(0, ${(initialScroll.current / 100)} * document.body.scrollHeight);`}
            // injectedJavaScriptBeforeContentLoaded={injectedJS}
            style={{ flex: 1, backgroundColor: colors.background }}
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
        </Animated.View>
      )}

      <FloatingHeader
        toggleChapterList={toggleChapterList}
        headerVisibility={headerVisibility}
        setHeaderVisibility={setHeaderVisibility}
        goToNextChapter={() => setIndex(index + 1)}
        isNextAvailable={(epubHandler.current?.getSpine()?.length ?? 0) - 1 <= index}
        isPrevAvailable={index <= 0}
        goToPrevChapter={() => setIndex(index - 1)}
      />

      <ChapterListModal
        toggleChapterList={toggleChapterList}
        chapterListVisibility={chapterListVisibility}
        toc={epubHandler.current?.getToc()}
        callBack={setChapterIndex}
      />
    </View>
  );
}