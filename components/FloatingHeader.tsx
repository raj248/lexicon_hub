import React, { useState, useEffect } from "react";
import { View, Text, Switch, Modal, TouchableWithoutFeedback } from "react-native";
import { Appbar, Card } from "react-native-paper";
import { useColorScheme } from "~/lib/useColorScheme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { router } from "expo-router";
import { useRuntimeStore } from "~/stores/useRuntimeStore";

export default function FloatingHeader() {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { headerVisibility, setHeaderVisibility } = useRuntimeStore(); // Ensure you have a setter
  const translateX = useSharedValue(headerVisibility ? 0 : 100);
  const width = useSharedValue(60);
  const { colors } = useColorScheme();

  useEffect(() => {
    width.value = withTiming(settingsExpanded ? 200 : 60, { duration: 400 });
  }, [settingsExpanded]);

  useEffect(() => {
    if (!headerVisibility) setSettingsExpanded(false);
    translateX.value = withTiming(headerVisibility ? 0 : 100, { duration: 100 });
  }, [headerVisibility]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: width.value,
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
                right: 10,
                top: "30%",
                backgroundColor: "grey",
                borderRadius: 16,
                paddingVertical: 10,
                alignItems: "center",
                elevation: 4,
              },
              animatedStyles,
            ]}
          >
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Appbar.Action icon="arrow-left" onPress={() => router.back()} color={colors.background} />
              <Appbar.Action icon="bookmark" onPress={() => { }} color={colors.background} />
              <Appbar.Action icon="cog" onPress={() => setSettingsExpanded(!settingsExpanded)} color={colors.background} />
              <Appbar.Action icon="file-document-outline" onPress={() => setSettingsExpanded(!settingsExpanded)} color={colors.background} />
            </View>

            {settingsExpanded && (
              <Card style={{ padding: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Customization</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text>Dark Mode</Text>
                  <Switch value={false} onValueChange={() => { }} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text>Font Size</Text>
                  <Text>18px</Text>
                </View>
              </Card>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
