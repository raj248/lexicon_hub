import React, { useEffect } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Chapter } from "~/stores/bookStore";
import { Text } from "~/components/nativewindui/Text";
import { FlashList } from "@shopify/flash-list";

const screenWidth = Dimensions.get("window").width;

export default function ChaptersModal({
  visible,
  onClose,
  chapters,
}: {
  visible: boolean;
  onClose: () => void;
  chapters: Chapter[];
}) {
  const translateX = useSharedValue(screenWidth);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(screenWidth, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);


  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return visible ? (
    <>
      {/* Background Overlay */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9998,
          },
          overlayStyle,
        ]}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Chapter List Modal */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: screenWidth * 0.6,
            backgroundColor: "white",
            paddingTop: 50,
            borderLeftWidth: 1,
            borderLeftColor: "#ddd",
            zIndex: 9999,
          },
          animatedStyle,
        ]}
      >
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={{ padding: 10, alignSelf: "flex-end" }}>
          <Text style={{ fontSize: 18, color: "red" }}>Close</Text>
        </TouchableOpacity>

        {/* Chapters List */}
        <FlashList
          data={chapters}
          keyExtractor={(item, index) => index.toString()}
          estimatedItemSize={50}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-end my-4">
              <TouchableOpacity
                onPress={() => console.log(`Go to ${item.title}`)}
                style={{
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ddd",
                }}
              >
                <Text className="text-l font-bold">{item.title}</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{
            paddingVertical: 10,
          }}
        />
      </Animated.View>
    </>
  ) : null;
}
