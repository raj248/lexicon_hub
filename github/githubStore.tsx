import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { backupAll, restoreData } from "./githubService";

interface GitHubStore {
  owner: string;
  repo: string;
  branch: string;
  token: string;

  lastBackup: number | null;
  autoBackup: boolean;
  useEncryption: boolean;

  addCredentials: (owner: string, repo: string, branch: string, token: string) => void;
  setAutoBackup: (value: boolean) => void;
  setEncryption: (value: boolean) => void;

  backupNow: (progress: any, books: any, watchlist: any) => Promise<void>;
  restoreFromGitHub: (type: "progress" | "books" | "watchlist") => Promise<any>;
}

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set, get) => ({
      owner: "",
      repo: "",
      branch: "",
      token: "",

      lastBackup: null,
      autoBackup: false,
      useEncryption: false,

      addCredentials(owner, repo, branch, token) {
        set({ owner, repo, branch, token });
      },

      setAutoBackup: (value) => set({ autoBackup: value }),
      setEncryption: (value) => set({ useEncryption: value }),

      backupNow: async (progress, books, watchlist) => {
        const { owner, repo, branch, token, useEncryption } = get();
        await backupAll(owner, repo, branch, token, useEncryption, progress, books, watchlist);
        set({ lastBackup: Date.now() });
      },

      restoreFromGitHub: async (type) => {
        const { owner, repo, branch, token } = get();
        return await restoreData(owner, repo, branch, token, type);
      },
    }),
    {
      name: "github-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
