import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import * as FileUtil from "~/modules/FileUtil"
import { Button } from "react-native-paper";
import { useColorScheme } from "~/lib/useColorScheme";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { colors } = useColorScheme();


  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // Hide header
    setTimeout(() => setLoading(false), 500); // Short delay
    (async () => {
      const permission = await FileUtil.checkFilePermission();
      if (permission) setLoading(false);
    })()
  }, []);

  const onclick = async () => {
    const permission = await FileUtil.RequestStoragePermission()
    if (permission) setLoading(false);
  }
  if (!loading) return <Redirect href="/(tabs)" />;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button icon="magnify" mode="elevated" className="mr-4 mt-[300]" rippleColor={colors.primary} onPress={onclick}>
        Grant File Permission
      </Button>
    </View>
  );
}
