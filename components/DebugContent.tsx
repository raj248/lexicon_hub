import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text } from "./nativewindui/Text";
import { Button } from "./nativewindui/Button";
import { useGitHubStore } from "~/github/githubStore";
import { checkOrCreateIndexRepo } from "~/github/initializeGitHub";
import { useBookStore } from "~/stores/bookStore";
import { Button as NativeButton } from "./Button";
import { useProgressStore } from "~/stores/progressStore";

export function DebugContent() {
  const { addCredentials, backupNow, restoreFromGitHub, lastBackup, setAutoBackup, setEncryption, autoBackup, useEncryption } = useGitHubStore();
  const [restoredData, setRestoredData] = useState<any>(null);
  const [size, setSize] = useState<number>(0);
  const [credentials, setCredentials] = useState({
    owner: "",
    repo: "",
    branch: "",
    token: ""
  });

  async function handleBackup() {
    console.log("Starting backup...");
    const books = useBookStore.getState().books;
    const progress = useProgressStore.getState().progress;

    await backupNow(progress, books, {});
    console.log("Backup completed.");
  }

  async function jsonBooks() {
    console.log("Books in json stringify...");
    const books = useBookStore.getState().books;
    for (const id in books) {
      if (Object.prototype.hasOwnProperty.call(books, id)) {
        const book = books[id];
        console.info(`Book : ${id}`);
        console.log(JSON.stringify(book));

      }
    }
  }

  async function handleRestore(type: "progress" | "books" | "watchlist") {
    console.log(`Restoring ${type}...`);
    const data = await restoreFromGitHub(type);
    setRestoredData({ [type]: data });
    // console.log(`Restored ${type}:`, data);
    console.log("Restore completed.")
  }

  async function addGitCredentials() {
    addCredentials(
      "raj248",
      "books-backup-index",
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

  async function getRepoSize() {
    const size = await useGitHubStore.getState().getSize().catch(console.error);
    const repo = await useGitHubStore.getState().getRepo().catch(console.error);
    size ? setSize(size) : console.log("no size")
    console.log("Repo size:", size);
    setRestoredData(repo)
  }

  async function getBackupIndex() {
    const index = await useGitHubStore.getState().getIndex().catch(console.error);
    console.log("Backup index:", index);
  }
  return (
    <ScrollView className="p-4">
      <NativeButton title="Clear Debug" onPress={useBookStore.getState().debugClear} />
      <NativeButton title="Get Repo Size" onPress={getRepoSize} className="mt-4" />
      <NativeButton title="Get Index" onPress={getBackupIndex} className="mt-4" />
      <Text>{size}</Text>
      <Text className="text-xl font-bold">GitHub Backup Debug</Text>
      <Text>Last Backup: {lastBackup ? new Date(lastBackup).toLocaleString() : "Never"}</Text>
      <Button className="m-2 p-2 bg-blue-500" onPress={handleBackup}>
        <Text>Backup Now</Text>
      </Button>

      <Button className="m-2 p-2 bg-pink-500" onPress={jsonBooks}>
        <Text>books JSON</Text>
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
    </ScrollView>
  );
}