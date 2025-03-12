import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import { Card } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

export default function SettingsPanel({ visible }: { visible: boolean }) {
  const [darkMode, setDarkMode] = useState(false);
  const translateY = useSharedValue(visible ? 0 : -200); // Start off-screen

  // Animate panel on visibility change
  React.useEffect(() => {
    translateY.value = withTiming(visible ? 60 : -200, { duration: 300 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
    pointerEvents: visible ? "auto" : "none", // Enable/Disable interactions
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: "100%",
          padding: 15,
          zIndex: 10, // Ensure it's on top
        },
        animatedStyle,
      ]}
    >
      <Card style={{ padding: 10 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Customization</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Font Size</Text>
          <Text>18px</Text>
        </View>
      </Card>
    </Animated.View>
  );
}
