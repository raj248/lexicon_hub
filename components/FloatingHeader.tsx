import React, { useState, useEffect } from "react";
import { View, Modal, TouchableWithoutFeedback } from "react-native";
import { Appbar } from "react-native-paper";
import { useColorScheme } from "~/lib/useColorScheme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useRuntimeStore } from "~/stores/useRuntimeStore";

export default function FloatingHeader() {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { setHeaderVisibility, toggleChapterList } = useRuntimeStore();
  const headerVisibility = useRuntimeStore.getState().headerVisibility;
  const translateX = useSharedValue(headerVisibility ? 0 : 100);
  const width = useSharedValue(60);
  const newViewOpacity = useSharedValue(0);
  const newViewTranslateX = useSharedValue(50);
  const { colors } = useColorScheme();

  useEffect(() => {
    width.value = withTiming(settingsExpanded ? 300 : 60, { duration: 400 });
    newViewOpacity.value = withTiming(settingsExpanded ? 1 : 0, { duration: 300 });
    newViewTranslateX.value = withTiming(settingsExpanded ? 0 : 50, { duration: 300 });
  }, [settingsExpanded]);

  useEffect(() => {
    if (!headerVisibility) setSettingsExpanded(false);
    translateX.value = withTiming(headerVisibility ? 0 : 100, { duration: 0 });
  }, [headerVisibility]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: width.value,
  }));

  const newViewStyles = useAnimatedStyle(() => ({
    opacity: newViewOpacity.value,
    transform: [{ translateX: newViewTranslateX.value }],
  }));

  return (
    <Modal transparent visible={headerVisibility}>
      <TouchableWithoutFeedback onPress={() => setHeaderVisibility(false)}>
        <View style={{ flex: 1 }}>
          <Animated.View
            pointerEvents="auto"
            style={[
              {
                position: "absolute",
                right: 20,
                top: "30%",
                backgroundColor: "grey",
                borderRadius: 16,
                paddingVertical: 10,
                alignItems: "center",
                elevation: 4,
                flexDirection: "row",
                justifyContent: "space-between",
                overflow: "hidden",
              },
              animatedStyles,
            ]}
          >
            <View
              className="flex-col items-center justify-center"
            >
              <Appbar.Action icon="arrow-left" onPress={() => router.back()} color={colors.background} />
              <Appbar.Action icon="bookmark" onPress={() => { }} color={colors.background} />
              <Appbar.Action icon="cog" onPress={() => setSettingsExpanded(!settingsExpanded)} color={colors.background} />
              <Appbar.Action icon="file-document-outline" onPress={toggleChapterList} color={colors.background} />
            </View>

            {/* New View (Visible After Expansion) */}
            <Animated.View
              style={[
                {
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: 10,
                  marginRight: 10,
                },
                newViewStyles,
              ]}
            >
              <Appbar.Action icon="cog" onPress={() => { }} color={colors.background} />
            </Animated.View>


          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
