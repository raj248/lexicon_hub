import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { View, ActivityIndicator, ScrollView, StatusBar } from "react-native";
import WebView from "react-native-webview";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Chapter, useBookStore } from "~/stores/bookStore";
import processChapter from "~/utils/processChapter";
import { FAB } from "react-native-paper";
import FloatingHeader from "~/components/FloatingHeader";

export default function ReaderScreen() {
  const navigation = useNavigation();
  const { bookId } = useLocalSearchParams();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fabOpen, setFabOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,  // Make it overlay content
      headerTitle: "",          // Hide title
    });
  }, [navigation]);


  // Hide status bar on screen mount and restore on unmount
  useEffect(() => {
    StatusBar.setHidden(true, "fade");
    return () => StatusBar.setHidden(false, "fade");
  }, []);

  useEffect(() => {
    async function loadContent() {
      const styledContent = await processChapter(bookId as string);
      setHtmlContent(styledContent || "");

      // Load EPUB chapters
      const epubChapters = await useBookStore.getState().getChapters(bookId as string);
      setChapters(epubChapters || []);
    }
    loadContent();
  }, [bookId]);

  // JavaScript to detect clicks inside WebView
  const injectedJS = `
    document.addEventListener("click", function() {
      window.ReactNativeWebView.postMessage("toggleHeader");
    });
    true;
  `;

  return (
    <View className="flex-1">
      {/* Floating Header */}
      <View
        className="absolute top-10 left-0 right-0 z-10"
        pointerEvents={headerVisible ? "auto" : "none"} // Blocks touches when hidden
      >
        <FloatingHeader headerVisible={headerVisible} />
      </View>

      {/* Settings Panel */}
      {/* {showSettings && (
        <View className="absolute top-12 left-0 right-0 z-20 bg-white shadow-lg">
          <SettingsPanel visible={showSettings} />
        </View>
      )} */}

      {/* WebView */}
      <View className="flex-1" pointerEvents={"auto"}>
        {htmlContent ? (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
            javaScriptEnabled
            injectedJavaScript={injectedJS}
            onMessage={(event) => {
              if (event.nativeEvent.data === "toggleHeader") {
                setHeaderVisible((prev) => !prev);
              }
            }}
            scalesPageToFit
            domStorageEnabled
            startInLoadingState
          />
        ) : (
          <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />
        )}
      </View>

      {/* FAB Group with Scrollable List */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? "close" : "book-open-variant"}
        actions={[]}
        onStateChange={({ open }) => setFabOpen(open)}

        style={{ position: "absolute", bottom: 40, right: 20 }}
      />

      {/* Separate ScrollView for Chapters */}
      {fabOpen && (
        <ScrollView
          style={{
            position: "absolute",
            bottom: 100,
            right: 20,
            maxHeight: 300,
            backgroundColor: "white",
            borderRadius: 10,
            elevation: 5,
          }}
        >
          {chapters.map((ch, index) => (
            <FAB
              key={index}
              icon="book"
              label={ch.title}
              onPress={() => console.log(`Go to ${ch.title}`)}
              style={{ marginVertical: 5 }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
