import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

const GITHUB_OWNER = "your-username";  // Replace with your GitHub username
const GITHUB_REPO = "your-repo-name";  // Replace with your repo name
const BRANCH = "master";  // Change if using a different branch
const TOKEN = "your-personal-access-token"; // Store securely!

const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

interface GitHubStore {
  lastBackup: number | null;
  autoBackup: boolean;
  setAutoBackup: (value: boolean) => void;
  backupNow: (progress: any, books: any, watchlist: any) => Promise<void>;
  restoreFromGitHub: () => Promise<{ progress: any; books: any; watchlist: any } | null>;
}

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set) => ({
      lastBackup: null,
      autoBackup: false,

      setAutoBackup: (value) => set({ autoBackup: value }),

      backupNow: async (progress, books, watchlist) => {
        try {
          const folders = ["progress", "books", "watchlist"];
          for (const folder of folders) {
            await ensureFolderExists(folder);
          }

          await backupData("progress/progress.json", JSON.stringify(progress));
          await backupData("books/books.json", JSON.stringify(books));
          await backupData("watchlist/watchlist.json", JSON.stringify(watchlist));

          set({ lastBackup: Date.now() });
          console.log("Backup completed successfully.");
        } catch (error) {
          console.error("Backup failed:", error);
        }
      },

      restoreFromGitHub: async () => {
        try {
          const progressData = await fetchData("progress/progress.json");
          const booksData = await fetchData("books/books.json");
          const watchlistData = await fetchData("watchlist/watchlist.json");

          return {
            progress: progressData ? JSON.parse(progressData) : null,
            books: booksData ? JSON.parse(booksData) : null,
            watchlist: watchlistData ? JSON.parse(watchlistData) : null,
          };
        } catch (error) {
          console.error("Restore failed:", error);
          return null;
        }
      },
    }),
    {
      name: "github-store", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function ensureFolderExists(folder: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/${folder}`, { headers: HEADERS });
    if (!response.ok) {
      if (response.status === 404) {
        await backupData(`${folder}/.gitkeep`, "");
      } else {
        throw new Error(`Failed to check folder: ${folder}`);
      }
    }
  } catch (error) {
    console.error("Error ensuring folder exists:", error);
  }
}

async function backupData(path: string, data: string): Promise<void> {
  try {
    const fileUrl = `${BASE_URL}/${path}`;
    const getResponse = await fetch(fileUrl, { headers: HEADERS });
    let sha = null;

    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    const putResponse = await fetch(fileUrl, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({
        message: `Backup for ${path}`,
        content: Buffer.from(data).toString("base64"),
        branch: BRANCH,
        sha,
      }),
    });

    if (!putResponse.ok) {
      throw new Error(`Failed to backup ${path}`);
    }
  } catch (error) {
    console.error("Backup error:", error);
  }
}

async function fetchData(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/${path}`, { headers: HEADERS });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No backup found for ${path}`);
        return null;
      }
      throw new Error(`Failed to fetch ${path}`);
    }
    const fileData = await response.json();
    return Buffer.from(fileData.content, "base64").toString();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
