import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text } from "./nativewindui/Text";
import { Button } from "./nativewindui/Button";
import { useGitHubStore } from "~/github/githubStore";
import { checkOrCreateIndexRepo } from "~/utils/initializeGitHub";

export function DebugContent() {
  const { addCredentials, backupNow, restoreFromGitHub, lastBackup, setAutoBackup, setEncryption, autoBackup, useEncryption } = useGitHubStore();
  const [restoredData, setRestoredData] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    owner: "",
    repo: "",
    branch: "",
    token: ""
  });

  async function handleBackup() {
    console.log("Starting backup...");
    await backupNow({ progress: "Sample Progress" }, { books: "Sample Books" }, { watchlist: "Sample Watchlist" });
    console.log("Backup completed.");
  }

  async function handleRestore(type: "progress" | "books" | "watchlist") {
    console.log(`Restoring ${type}...`);
    const data = await restoreFromGitHub(type);
    setRestoredData({ [type]: data });
    console.log(`Restored ${type}:`, data);
  }

  async function addGitCredentials() {
    addCredentials(
      "raj248",
      "backup",
      "master",
      "YOUR_TOKEN_HERE"
    )
    console.log("Git credentials added.");
    const creds = useGitHubStore.getState().owner + " " + useGitHubStore.getState().repo + " " + useGitHubStore.getState().branch + " " + useGitHubStore.getState().token;
    console.log(creds);

    setCredentials({
      owner: useGitHubStore.getState().owner,
      repo: useGitHubStore.getState().repo,
      branch: useGitHubStore.getState().branch,
      token: useGitHubStore.getState().token
    })
  }
  return (
    <ScrollView className="p-4">
      <Text className="text-xl font-bold">GitHub Backup Debug</Text>
      <Text>Last Backup: {lastBackup ? new Date(lastBackup).toLocaleString() : "Never"}</Text>
      <Button className="m-2 p-2 bg-blue-500" onPress={handleBackup}>
        <Text>Backup Now</Text>
      </Button>

      <Text className="text-lg mt-4">Restore Data</Text>
      <Button className="m-2 p-2 bg-green-500" onPress={() => handleRestore("progress")}>
        <Text>Restore Progress</Text>
      </Button>
      <Button className="m-2 p-2 bg-green-500" onPress={() => handleRestore("books")}>
        <Text>Restore Books</Text>
      </Button>
      <Button className="m-2 p-2 bg-green-500" onPress={() => handleRestore("watchlist")}>
        <Text>Restore Watchlist</Text>
      </Button>

      <Text className="mt-4">Restored Data:</Text>
      <Text className="text-xs">{JSON.stringify(restoredData, null, 2)}</Text>

      <Text className="text-lg mt-4">Settings</Text>
      <Button className="m-2 p-2 bg-purple-500" onPress={() => setAutoBackup(!autoBackup)}>
        <Text>
          Toggle Auto Backup (Current: {autoBackup ? "On" : "Off"})
        </Text>
      </Button>
      <Button className="m-2 p-2 bg-purple-500" onPress={() => setEncryption(!useEncryption)}>
        <Text>
          Toggle Encryption (Current: {useEncryption ? "On" : "Off"})
        </Text>
      </Button>

      <Button className="m-2 p-2 bg-yellow-500" onPress={checkOrCreateIndexRepo}>
        <Text>Check or create repo</Text>
      </Button>
      <Button onPress={addGitCredentials}>
        <Text>
          Add Git Credentials
        </Text>
      </Button>
      <Text>
        {credentials.owner} {credentials.repo} {credentials.branch} {credentials.token}
      </Text>

      <Text>{process.env.GITHUB_TOKEN}</Text>
    </ScrollView>
  );
}