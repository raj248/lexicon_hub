import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { backupAll, getBackupIndex, getBackupRepo, getRepoSize, restoreData } from "./githubService";
import { getGitHubToken, setGitHubToken } from "./githubUtils";

interface GitHubStore {
  owner: string;
  repo: string;
  branch: string;

  lastBackup: number | null;
  autoBackup: boolean;
  useEncryption: boolean;

  addCredentials: (owner: string, repo: string, branch: string, token: string) => void;
  setAutoBackup: (value: boolean) => void;
  setEncryption: (value: boolean) => void;

  backupNow: (progress: any, books: any, watchlist: any) => Promise<void>;
  restoreFromGitHub: (type: "progress" | "books" | "watchlist") => Promise<any>;

  getSize: () => Promise<number | null>;
  getRepo: () => Promise<string>;
  getIndex: () => Promise<any>;
}

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set, get) => ({
      owner: "YOUR_GITHUB_USERNAME_HERE",
      repo: "books-backup-index",
      branch: "master",

      lastBackup: null,
      autoBackup: false,
      useEncryption: false,

      addCredentials(owner, repo, branch, token) {
        if (owner) set({ owner });
        if (repo) set({ repo });
        if (branch) set({ branch });
        setGitHubToken(token)
      },

      setAutoBackup: (value) => set({ autoBackup: value }),
      setEncryption: (value) => set({ useEncryption: value }),

      backupNow: async (progress, books, watchlist) => {
        const token = await getGitHubToken()
        const { owner, repo, branch, useEncryption } = get();
        if (!token) {
          return;
        }
        await backupAll(owner, repo, branch, token, useEncryption, progress, books, watchlist);
        set({ lastBackup: Date.now() });
      },

      restoreFromGitHub: async (type) => {
        const { owner, repo, branch } = get();
        const token = await getGitHubToken().catch(console.log)
        if (!token) {
          return;
        }
        return await restoreData(owner, repo, branch, token, type).catch(console.log);
      },
      getSize: async () => {
        const { owner, repo, branch } = get();
        const token = await getGitHubToken()
        if (!token) {
          return -1;
        }
        return await getRepoSize(owner, repo, token);
      },

      getRepo: async () => {
        const { owner, repo, branch } = get();
        const token = await getGitHubToken()
        if (!token) {
          return "";
        }
        return await getBackupRepo(owner, token);
      },
      getIndex: async () => {
        const { owner, repo, branch } = get();
        const token = await getGitHubToken()
        if (!token) {
          return "";
        }
        return await getBackupIndex(owner, token);
      },
    }),
    {
      name: "github-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
