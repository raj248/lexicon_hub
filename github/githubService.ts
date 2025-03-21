import { fetchWithRetry, base64Encode, base64Decode } from "./githubUtils";

const BASE_URL = (owner: string, repo: string) => 
  `https://api.github.com/repos/${owner}/${repo}/contents`;

const HEADERS = (token: string) => ({
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
});

async function ensureFolderExists(owner: string, repo: string, token: string, folder: string) {
  try {
    const response = await fetch(`${BASE_URL(owner, repo)}/${folder}`, { headers: HEADERS(token) });
    if (!response.ok && response.status === 404) {
      await backupData(owner, repo, "", token, `${folder}/.gitkeep`, "");
    }
  } catch (error) {
    console.error("Error ensuring folder exists:", error);
  }
}

export async function backupAll(
  owner: string, repo: string, branch: string, token: string, useEncryption: boolean, 
  progress: any, books: any, watchlist: any
) {
  try {
    const folders = ["progress", "books", "watchlist"];
    for (const folder of folders) {
      await ensureFolderExists(owner, repo, token, folder);
    }

    await backupData(owner, repo, branch, token, "progress/progress.json", progress, useEncryption);
    await backupData(owner, repo, branch, token, "books/books.json", books, useEncryption);
    await backupData(owner, repo, branch, token, "watchlist/watchlist.json", watchlist, useEncryption);

    console.log("Backup completed successfully.");
  } catch (error) {
    console.error("Backup failed:", error);
  }
}

async function backupData(
  owner: string, repo: string, branch: string, token: string, path: string, 
  data: any, useEncryption: boolean = false
) {
  try {
    const fileUrl = `${BASE_URL(owner, repo)}/${path}`;
    const existingFile = await fetch(fileUrl, { headers: HEADERS(token) });
    let sha = null;

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      sha = fileData.sha;

      console.log("no error so far")
      const content = fileData.content.trim(); // Remove whitespace
      const paddedContent = content + "=".repeat((4 - (content.length % 4)) % 4); // Fix padding
      const existingContent = base64Decode(paddedContent);

      console.log("nothing after decoding")
      if (existingContent === JSON.stringify(data)) {
        console.log(`Skipping ${path}, no changes detected.`);
        return;
      }
    }

    const jsonString = JSON.stringify(data);
    const content = base64Encode(jsonString); // No need for manual padding
    
    await fetchWithRetry(fileUrl, {
      method: "PUT",
      headers: HEADERS(token),
      body: JSON.stringify({ message: `Backup ${path}`, content, branch, sha }),
    });

  } catch (error) {
    console.error("Backup error:", error);
  }
}

export async function restoreData(owner: string, repo: string, branch: string, token: string, type: "progress" | "books" | "watchlist") {
  try {
    const data = await fetchData(owner, repo, token, `${type}/${type}.json`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Restore failed for ${type}:`, error);
    return null;
  }
}

async function fetchData(owner: string, repo: string, token: string, path: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL(owner, repo)}/${path}`, { headers: HEADERS(token) });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No backup found for ${path}`);
        return null;
      }
      throw new Error(`Failed to fetch ${path}`);
    }

    const fileData = await response.json();

    const content = fileData.content.trim();
    const paddedContent = content + "=".repeat((4 - (content.length % 4)) % 4);
    return base64Decode(paddedContent);

  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
