import React, { useState, useEffect } from "react";
import { View, Modal, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { Appbar } from "react-native-paper";
import { useColorScheme } from "~/lib/useColorScheme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Text } from "./nativewindui/Text";
import { usePreferencesStore } from "~/stores/preferenceStore";

export default function FloatingHeader({
  headerVisibility,
  toggleChapterList,
  setHeaderVisibility,
  goToPrevChapter,
  goToNextChapter,
  isNextAvailable,
  isPrevAvailable
}: any) {
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  const translateX = useSharedValue(headerVisibility ? 0 : 100);
  const width = useSharedValue(60);
  const headerOpacity = useSharedValue(0);
  const newViewOpacity = useSharedValue(0);
  const newViewTranslateX = useSharedValue(50);

  const slideAnim = useSharedValue(headerVisibility ? 0 : 50);
  const buttonOpacity = useSharedValue(headerVisibility ? 1 : 0);

  const preferences = usePreferencesStore();
  const { colors, isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const [switching, setSwitching] = useState(false);

  const handleToggle = async () => {
    if (switching) return; // Prevent spam clicking
    setSwitching(true);
    requestAnimationFrame(() => {
      toggleColorScheme(); // Switch theme
      // usePreferencesStore.getState().updatePreferences({ readingMode: isDarkColorScheme ? "dark" : "light" });
      setTimeout(() => setSwitching(false), 200); // Allow UI to update
    });
  };

  useEffect(() => {
    if (!headerVisibility) setHeaderVisibility(true)
    width.value = withTiming(settingsExpanded ? 320 : 60, { duration: 400 });
    newViewOpacity.value = withTiming(settingsExpanded ? 1 : 0, { duration: 600 });
    newViewTranslateX.value = withTiming(settingsExpanded ? 0 : 50, { duration: 300 });
  }, [settingsExpanded]);

  useEffect(() => {
    if (!headerVisibility) setSettingsExpanded(false);
    translateX.value = withTiming(headerVisibility ? 0 : 100, { duration: 200 });
    headerOpacity.value = withTiming(headerVisibility ? 1 : 0, { duration: 300 });
  }, [headerVisibility]);

  useEffect(() => {
    slideAnim.value = withTiming(headerVisibility ? 0 : 50, { duration: 200 });
    buttonOpacity.value = withTiming(headerVisibility ? 1 : 0, { duration: 200 });
  }, [headerVisibility]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: headerOpacity.value,
    width: width.value,
  }));

  const newViewStyles = useAnimatedStyle(() => ({
    opacity: newViewOpacity.value,
    transform: [{ translateX: newViewTranslateX.value }],
  }));
  const [containerWidth, setContainerWidth] = useState(0);
  return (
    <>
      <Animated.View
        pointerEvents="auto"
        style={[
          {
            flex: 1,

            position: "absolute",
            right: 20,
            top: "30%",
            backgroundColor: colors.card,
            borderRadius: 16,
            paddingVertical: 10,
            alignItems: "flex-start",
            elevation: 4,
            flexDirection: "row",
            // justifyContent: "space-between",
            width: 60,
            height: 230,
          },
          animatedStyles,
        ]}
      >
        <View className="flex-col items-center justify-center">
          <Appbar.Action icon="arrow-left" onPress={() => router.back()} color={colors.foreground} />
          <Appbar.Action icon="bookmark" onPress={() => { }} color={colors.foreground} />
          <Appbar.Action icon="cog" onPress={() => setSettingsExpanded(!settingsExpanded)} color={colors.foreground} />
          <Appbar.Action icon="file-document-outline" onPress={toggleChapterList} color={colors.foreground} />
        </View>

        {settingsExpanded && (
          <Animated.View
            style={[
              {
                backgroundColor: colors.grey5,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                paddingRight: 20,
                width: "80%",
                // height: 200,
                height: "100%",
                overflow: "hidden",
              },
              newViewStyles,
            ]}
          >
            <View className="flex-row justify-between items-center p-4">
              <Text>Change Theme</Text>
              <Appbar.Action
                icon={isDarkColorScheme ? "weather-night" : "weather-sunny"}
                onPress={handleToggle}
                color={colors.foreground}
                disabled={switching}
              />
            </View>
            <View className="flex-row justify-between items-center px-4">
              <Text>Font</Text>
              <Appbar.Action icon="chevron-left" onPress={() => preferences.setFontSize(preferences.fontSize - 1)} color={colors.foreground} />
              <Text>{preferences.fontSize}</Text>
              <Appbar.Action icon="chevron-right" onPress={() => preferences.setFontSize(preferences.fontSize + 1)} color={colors.foreground} />
            </View>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        style={[
          {
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: [{ translateX: -containerWidth / 2 }, { translateY: slideAnim }],
            flexDirection: "row",
            gap: 30,
            backgroundColor: colors.card,
            borderRadius: 10,
            opacity: buttonOpacity, // Controls visibility
          },
        ]}
      >
        <TouchableOpacity onPress={goToPrevChapter} disabled={isPrevAvailable}>
          <Appbar.Action icon="chevron-left" color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextChapter} disabled={isNextAvailable}>
          <Appbar.Action icon="chevron-right" color={colors.foreground} />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}
