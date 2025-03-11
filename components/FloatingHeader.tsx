import React, { useState } from "react";
import { Animated } from "react-native";
import { Appbar } from "react-native-paper";

export default function FloatingHeader({ onSettingsPress }: { onSettingsPress: () => void }) {
  const [visible, setVisible] = useState(true);
  const animation = new Animated.Value(visible ? 1 : 0);

  function toggleHeader() {
    Animated.timing(animation, {
      toValue: visible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(!visible));
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: animation.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }),
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        paddingTop: 30,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
      }}
    >
      <Appbar.Action icon="bookmark" onPress={() => console.log("Bookmark added")} />
      <Appbar.Action icon="cog" onPress={onSettingsPress} />
    </Animated.View>
  );
}
