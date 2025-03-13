import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, Dimensions, Modal, FlatList } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Chapter } from "~/stores/bookStore";
import { Text } from "~/components/nativewindui/Text";
import { useRuntimeStore } from "~/stores/useRuntimeStore";

interface ChapterListModalProps {
  currentChapters: Chapter[] | undefined;
  callBack: (item: number) => void;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function ChapterListModal({ currentChapters, callBack }: ChapterListModalProps) {
  const { toggleChapterList } = useRuntimeStore.getState();
  const chapterListVisibility = useRuntimeStore.getState().chapterListVisibility;

  const translateX = useSharedValue(screenWidth);
  const overlayOpacity = useSharedValue(0);
  const [hidden, setHidden] = useState(!chapterListVisibility);

  useEffect(() => {
    if (chapterListVisibility) {
      setHidden(false); // Keep modal visible
      translateX.value = withTiming(0, { duration: 500 });
      overlayOpacity.value = withTiming(1, { duration: 500 });
    } else {
      translateX.value = withTiming(screenWidth, { duration: 500 }, () => {
        runOnJS(setHidden)(true); // Hide only after animation ends
      });
      overlayOpacity.value = withTiming(0, { duration: 500 });
    }
  }, [chapterListVisibility]);

  const renderItem = useCallback(
    ({ item, index }: { item: Chapter, index: number }) => (
      <TouchableOpacity
        onPress={() => callBack(index)}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 15,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.3)",
        }}
      >
        <Text className="text-lg font-bold">{item.title}</Text>
      </TouchableOpacity>
    ),
    []
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    display: hidden ? "none" : "flex", // Hide modal instead of unmounting
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Modal transparent visible={!hidden}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
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
      </TouchableOpacity>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: screenHeight * 0.15,
            bottom: screenHeight * 0.15,
            right: 20,
            width: screenWidth * 0.65,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
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
        {/* can use flashlist as well */}
        <FlatList
          data={currentChapters}
          // keyExtractor={(item, index) => index.toString()}
          // estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </Animated.View>
    </Modal>
  );
}
