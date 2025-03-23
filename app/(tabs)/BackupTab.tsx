import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Switch } from "react-native-paper";
import { ActivityIndicator } from "~/components/nativewindui/ActivityIndicator";
import { Text } from "~/components/nativewindui/Text";
import { useGitHubStore } from "~/github/githubStore";

export default function BackupSyncTab() {
  const { lastBackup, autoBackup, setAutoBackup, backupNow, restoreFromGitHub } = useGitHubStore();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);

    await backupNow({}, {}, {});
    setLoading(false);
  };

  const handleRestore = async () => {
    setLoading(true);
    const data = await restoreFromGitHub("progress");
    console.log(data);
    setLoading(false);
  };

  return (
    <View className="flex-1 p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center mb-4"
          onPress={handleBackup}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Backup Now</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg items-center mb-4"
          onPress={handleRestore}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Restore Backup</Text>}
        </TouchableOpacity>

        <View className="flex-row justify-between items-center p-4 rounded-lg mb-4">
          <Text className="font-semibold">Enable Auto Backup</Text>
          <Switch value={autoBackup} onValueChange={setAutoBackup} />
        </View>

        <View className="p-4 rounded-lg mb-4">
          <Text className="font-semibold">Last Backup:</Text>
          <Text>{lastBackup ? new Date(lastBackup).toLocaleString() : "Never"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
