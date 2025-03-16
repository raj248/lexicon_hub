import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, Dimensions, Modal, FlatList } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Chapter } from "~/stores/bookStore";
import { Text } from "~/components/nativewindui/Text";

interface ChapterDrawerProps {
  toggleChapterList: () => void;
  chapterListVisibility: boolean;
  currentChapters: Chapter[] | undefined;
  callBack: (item: number) => void;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function ChapterDrawer({ currentChapters, callBack, toggleChapterList, chapterListVisibility }: ChapterDrawerProps) {

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

  const renderItem = useCallback(({ item, index }: { item: Chapter; index: number }) => (
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
    <Modal transparent visible={!hidden}>
      <Pressable
        style={{ flex: 1 }}
        // activeOpacity={1}
        onPress={toggleChapterList}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            },
            overlayStyle,
          ]}
        />
      </Pressable>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: screenHeight * 0.15,
            bottom: screenHeight * 0.15,
            right: 20,
            width: screenWidth * 0.65,
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
          data={currentChapters}
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
                  animated: true, // Set to false to avoid flickering
                });
              }
            }, 50); // Slight delay to ensure rendering is completed
          }}
        // keyboardShouldPersistTaps="handled" // Smooth scrolling capture
        />
      </Animated.View>
    </Modal>
  );
}