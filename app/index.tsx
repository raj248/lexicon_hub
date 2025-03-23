import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // Hide header
    setTimeout(() => setLoading(false), 500); // Short delay
  }, []);

  if (!loading) return <Redirect href="/(tabs)" />;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
}
