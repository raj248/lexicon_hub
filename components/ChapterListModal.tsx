import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, Dimensions, FlatList } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Chapter } from "~/stores/bookStore";
import { Text } from "~/components/nativewindui/Text";
import { useRuntimeStore } from "~/stores/useRuntimeStore";

interface ChapterDrawerProps {
  currentChapters: Chapter[] | undefined;
  callBack: (item: number) => void;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function ChapterDrawer({ currentChapters, callBack }: ChapterDrawerProps) {
  const { toggleChapterList } = useRuntimeStore.getState();
  const chapterListVisibility = useRuntimeStore.getState().chapterListVisibility;

  const translateX = useSharedValue(screenWidth); // Start hidden off-screen (right)
  const overlayOpacity = useSharedValue(0);
  const [hidden, setHidden] = useState(!chapterListVisibility);

  // Store FlatList reference
  const flatListRef = useRef<FlatList>(null);
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (chapterListVisibility) {
      setHidden(false);
      translateX.value = withTiming(0, { duration: 200 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withTiming(screenWidth, { duration: 200 }, () => {
        runOnJS(setHidden)(true);
      });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [chapterListVisibility]);

  const handleChapterSelection = useCallback((index: number) => {
    flatListRef.current?.scrollToOffset({ offset: scrollPosition.current, animated: false });
    callBack(index);
  }, [callBack]);

  const renderItem = useCallback(({ item, index }: { item: Chapter; index: number }) => (
    <Pressable
      onPress={() => handleChapterSelection(index)}
      className="py-3 px-4 border-b border-gray-300"
      android_ripple={{ color: "#ddd", borderless: false }}
    >
      <Text className="text-lg font-bold">{item.title}</Text>
    </Pressable>
  ), [handleChapterSelection]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    display: hidden ? "none" : "flex",
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <>
      {/* Overlay to darken the background */}
      {!hidden && (
        <Pressable
          style={{
            position: "absolute",
            width: screenWidth,
            height: screenHeight,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
          onPress={toggleChapterList}
        >
          <Animated.View style={[overlayStyle]} />
        </Pressable>
      )}

      {/* Right-Side Drawer Layout */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0, // Now appearing from the right
            width: screenWidth * 0.7,
            backgroundColor: "transparent",
            borderLeftWidth: 1,
            borderColor: "#ddd",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: -5, height: 0 }, // Shadow on the left
            zIndex: 1000, // Ensure it's on top of other components
          },
          animatedStyle,
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={currentChapters}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          onScroll={(event) => {
            scrollPosition.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        />
      </Animated.View>
    </>
  );
}
