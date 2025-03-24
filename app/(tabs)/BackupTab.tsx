import Animated, { SlideInDown, FadeOut, SlideInUp, SlideOutDown, SlideOutUp } from "react-native-reanimated";
import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Button, Switch, TextInput } from "react-native-paper";
import { ActivityIndicator } from "~/components/nativewindui/ActivityIndicator";
import { Text } from "~/components/nativewindui/Text";
import { useGitHubStore } from "~/github/githubStore";
import { useBookStore } from "~/stores/bookStore";
import { useProgressStore } from "~/stores/progressStore";
import { Dimensions } from "react-native";
export default function BackupSyncTab() {
  const {
    owner,
    repo,
    branch,
    lastBackup,
    autoBackup,
    setAutoBackup,
    addCredentials,
    backupNow,
    restoreFromGitHub
  } = useGitHubStore();
  const [loading, setLoading] = useState(false);
  const [configView, setCongifView] = useState(false);
  const [repoConfig, setRepoConfig] = useState(repo + " (Default)");
  const [ownerConfig, setOwnerConfig] = useState("");
  const [branchConfig, setBranchConfig] = useState(branch + " (Default)");
  const [tokenConfig, setTokenConfig] = useState("");

  const { width, height } = Dimensions.get("window");

  const handleBackup = async () => {
    setLoading(true);

    const books = useBookStore.getState().books;
    const progress = useProgressStore.getState().progress;

    await backupNow(progress, books, {});
    setLoading(false);
  };

  const handleRestore = async () => {
    // setLoading(true);
    console.log("restore started")
    const data = await restoreFromGitHub("progress").catch(err => console.log(err));
    // const obj = Object.fromEntries(data.map((id: string) => [id, data[id]]))
    useProgressStore.getState().populateProgress(data);
    setLoading(false);
  };

  const handleSave = async () => {
    addCredentials(ownerConfig, repoConfig, branchConfig, tokenConfig);
    setCongifView(!configView)
  }

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

        <View className="p-4 rounded-lg mb-4">
          <Text className="font-semibold">Git Credentials</Text>
          <Text>Repo : {repo}</Text>
          <Text>Owner : {owner}</Text>
          <Text>Branch : {branch}</Text>
        </View>
        <Button icon="key" mode="contained" className="mx-8 mb-4" rippleColor="white" onPress={() => setCongifView(!configView)} >
          Config Git Credentials
        </Button>
        {configView && (
          <Animated.View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -150 }, { translateY: -200 }], // Adjust offsets
              width: 300, // Fixed width
              backgroundColor: "white",
              padding: 16,
              borderRadius: 25,
              elevation: 5, // For shadow on Android
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
            entering={SlideInUp.delay(100)}
            exiting={SlideOutDown.delay(100)}
          >
            <TextInput label="Repository" mode="outlined" value={repoConfig} onChangeText={setRepoConfig} placeholder={repo} />
            <TextInput label="Username" mode="outlined" value={ownerConfig} onChangeText={setOwnerConfig} placeholder={owner} />
            <TextInput label="Branch" mode="outlined" value={branchConfig} onChangeText={setBranchConfig} placeholder={branch} />
            <TextInput label="Token" mode="outlined" value={tokenConfig} onChangeText={setTokenConfig} />

            <View className="flex-row justify-between items-center">
              <Button icon="close" mode="contained" className="ml-4 mt-2" buttonColor="red" rippleColor="white" onPress={() => setCongifView(!configView)}>
                Cancel
              </Button>
              <Button icon="key" mode="contained" className="mr-4 mt-2" buttonColor="green" rippleColor="white" onPress={handleSave}>
                Save
              </Button>
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}
