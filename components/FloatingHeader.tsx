import React, { useState, useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { Appbar, Card } from "react-native-paper";
import { useColorScheme } from "~/lib/useColorScheme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

export default function FloatingHeader({ headerVisible }: { headerVisible: boolean }) {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const translateY = useSharedValue(headerVisible ? 0 : -100);
  const height = useSharedValue(60); // Default header height
  const { colors } = useColorScheme();

  // Expand header height when settings are opened
  useEffect(() => {
    // if (headerVisible)
    height.value = withTiming(settingsExpanded ? 200 : 60, { duration: 400 });
  }, [settingsExpanded]);

  // Collapse settings if header disappears
  useEffect(() => {
    if (!headerVisible) {
      setSettingsExpanded(false);
    }
    translateY.value = withTiming(headerVisible ? 0 : -100, { duration: 300 });
  }, [headerVisible]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          alignSelf: "center",
          backgroundColor: "grey",
          borderRadius: 16,
          paddingHorizontal: 10,
          width: "90%",
          elevation: 4,
        },
        animatedStyles,
      ]}
    >
      {/* Floating Header */}
      <Appbar.Header
        mode="small"
        style={{
          backgroundColor: "transparent",
          width: "100%",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Appbar.BackAction onPress={() => { }} color={colors.background} />
          <Appbar.Action icon="bookmark" onPress={() => { }} color={colors.background} />
          <Appbar.Action icon="cog" onPress={() => setSettingsExpanded(!settingsExpanded)} color={colors.background} />
        </View>
      </Appbar.Header>

      {/* Expanding Settings Panel */}
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
  );
}
