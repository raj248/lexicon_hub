import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, Dimensions, Modal, FlatList } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Text } from "~/components/nativewindui/Text";
import { TocEntry } from "~/epub-core/types";

interface ChapterDrawerProps {
  toggleChapterList: () => void;
  chapterListVisibility: boolean;
  toc: TocEntry[] | undefined;
  callBack: (item: number) => void;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function ChapterDrawer({ toc, callBack, toggleChapterList, chapterListVisibility }: ChapterDrawerProps) {

  const translateX = useSharedValue(screenWidth);
  const overlayOpacity = useSharedValue(0);
  const [hidden, setHidden] = useState(!chapterListVisibility);

  // Store the FlatList reference
  const flatListRef = useRef<FlatList>(null);
  // Store the last scroll position
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (chapterListVisibility) {
      setHidden(false);
      translateX.value = withTiming(0, { duration: 200 });
      overlayOpacity.value = withTiming(1, { duration: 200 });

      // setTimeout(() => {
      //   if (flatListRef.current) {
      //     flatListRef.current.scrollToOffset({ offset: scrollPosition.current, animated: false });
      //   }
      // }, 2000);
      // runOnJS(toggleChapterList)();
    } else {
      translateX.value = withTiming(screenWidth, { duration: 200 }, () => {
        runOnJS(setHidden)(true);
      });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [chapterListVisibility]);

  const handleChapterSelection = useCallback((index: number) => {
    // Save scroll position
    flatListRef.current?.scrollToOffset({ offset: scrollPosition.current, animated: false });
    callBack(index);
  }, [callBack]);

  const renderItem = useCallback(({ item, index }: { item: TocEntry; index: number }) => (
    <Pressable
      onPress={() => handleChapterSelection(index)}
      className="py-3 px-4 border-b border-gray-300"
      android_ripple={{ color: "#ddd", borderless: false }} // Adds a ripple effect for feedback
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
    <Animated.View
      style={[
        {
          position: "absolute",
          top: screenHeight * 0.15, // Keep it near the top
          right: 20, // Align to the right side
          width: screenWidth * 0.65, // Take 65% of screen width
          maxHeight: screenHeight * 0.7, // Allow it to be dynamic but not exceed 70% of screen height
          backgroundColor: "grey",
          borderRadius: 16,
          padding: 15,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
        },
        animatedStyle,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={toc}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
        onScroll={(event) => {
          scrollPosition.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        onLayout={() => {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({
                offset: scrollPosition.current,
                animated: true,
              });
            }
          }, 50);
        }}
      />
    </Animated.View>

  );
}