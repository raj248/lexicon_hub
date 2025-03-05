import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "~/components/nativewindui/ActivityIndicator";
import { Text } from "~/components/nativewindui/Text";
import { Toggle } from "~/components/nativewindui/Toggle";
import { useGitHubStore } from "~/store/githubStore";

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
    await restoreFromGitHub();
    setLoading(false);
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Backup Now Button */}
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center mb-4"
          onPress={handleBackup}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Backup Now</Text>}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg items-center mb-4"
          onPress={handleRestore}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Restore Backup</Text>}
        </TouchableOpacity>

        {/* Auto Backup Toggle */}
        <View className="flex-row justify-between items-center p-4 bg-gray-100 rounded-lg mb-4">
          <Text className="font-semibold">Enable Auto Backup</Text>
          <Toggle value={autoBackup} onValueChange={setAutoBackup} />
        </View>

        {/* Last Backup Timestamp */}
        <View className="p-4 bg-gray-100 rounded-lg mb-4">
          <Text className="font-semibold">Last Backup:</Text>
          <Text>{lastBackup ? new Date(lastBackup).toLocaleString() : "Never"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
