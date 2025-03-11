import React, { useState } from "react";
import { View, Text, Switch, Animated } from "react-native";
import { Card } from "react-native-paper";

export default function SettingsPanel({ visible }: { visible: boolean }) {
  const [darkMode, setDarkMode] = useState(false);
  const animation = new Animated.Value(visible ? 1 : 0);

  Animated.timing(animation, {
    toValue: visible ? 1 : 0,
    duration: 300,
    useNativeDriver: false,
  }).start();

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: animation.interpolate({ inputRange: [0, 1], outputRange: [-200, 60] }),
        width: "100%",
        backgroundColor: "#fff",
        padding: 15,
        elevation: 5,
      }}
    >
      <Card>
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
