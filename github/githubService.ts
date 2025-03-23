
import { Book } from "~/stores/bookStore";


// import { fetchWithRetry, base64Encode, base64Decode } from "./githubUtils";
import { fetchWithRetry, base64Encode, base64Decode,utf8ToBase64, base64ToUtf8 } from "./githubUtils";

const BASE_URL = (owner: string, repo: string) => 
  `https://api.github.com/repos/${owner}/${repo}/contents`;

const HEADERS = (token: string) => ({
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
});

async function ensureFolderExists(owner: string, repo: string, branch:string, token: string, folder: string) {
  try {
    const response = await fetch(`${BASE_URL(owner, repo)}/${folder}`, { headers: HEADERS(token) });
    if (!response.ok && response.status === 404) {
      await backupData(owner, repo, branch, token, `${folder}/.gitkeep`, "");
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
    const folders = ["progress", "books", "watchlist", "sha1", "cover"];
    for (const folder of folders) {
      await ensureFolderExists(owner, repo, branch, token, folder);
    }

    // TODO: backup script
    // await backupData(owner, repo, branch, token, "books/books.json", books, useEncryption);
    await backupBooks(owner, repo, branch, token, books);
    await backupData(owner, repo, branch, token, "progress/progress.json", progress, useEncryption);
    await backupData(owner, repo, branch, token, "watchlist/watchlist.json", watchlist, useEncryption);

    console.log("Backup completed successfully.");
  } catch (error) {
    console.error("Backup failed:", error);
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

async function backupData(owner: string, repo: string, branch: string, token: string, path: string, data: any, useEncryption: boolean = false) {
  try {
    const fileUrl = `${BASE_URL(owner, repo)}/${path}`;
    const existingFile = await fetch(fileUrl, { headers: HEADERS(token) });
    let sha = null;

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      sha = fileData.sha;

      const content = fileData.content.trim(); // Remove whitespace
      const paddedContent = content + "=".repeat((4 - (content.length % 4)) % 4); // Fix padding
      const existingContent = base64Decode(paddedContent);

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

    let base64Content = fileData.content.replace(/\s/g, ""); // Trim whitespace
    base64Content += "=".repeat((4 - (base64Content.length % 4)) % 4); // Fix padding
    return base64ToUtf8(base64Content).replace(/[\u0000-\u001F]/g, "");

  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

async function backupBooks(
  owner: string, repo: string, branch: string, token: string, bookStore: Record<string, Book>
) {
  const filePath = "books/books.json";
  const fileUrl = `${BASE_URL(owner, repo)}/${filePath}`;
  const existingFile = await fetch(fileUrl, { headers: HEADERS(token) });
  let sha = null;
  let existingBooks: Record<string, Book> = {};

  if (existingFile.ok) {
    const fileData = await existingFile.json();
    sha = fileData.sha;

    try {
      // const existingContent = Buffer.from(fileData.content, "base64").toString("utf-8");
      let base64Content = fileData.content.replace(/\s/g, ""); // Trim whitespace
      base64Content += "=".repeat((4 - (base64Content.length % 4)) % 4); // Fix padding
      const existingContent = base64ToUtf8(base64Content).replace(/[\u0000-\u001F]/g, "");
      existingBooks = JSON.parse(existingContent); // Decode base64 JSON
    } catch (error) {
      console.error("Failed to decode existing books.json", error);
    }
  }

  // 2️⃣ Merge current `bookStore` with `existingBooks`
  const mergedBooks = { ...existingBooks, ...bookStore };
  const jsonString = JSON.stringify(mergedBooks);
  const content = utf8ToBase64(jsonString); // Encode as base64

  // 3️⃣ Upload merged `books.json`
  await fetchWithRetry(fileUrl, {
    method: "PUT",
    headers: HEADERS(token),
    body: JSON.stringify({ message: `Backup ${filePath}`, content, branch, sha }),
  });
}
