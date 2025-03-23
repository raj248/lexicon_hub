
import { Book } from "~/stores/bookStore";


// import { fetchWithRetry, base64Encode, base64Decode } from "./githubUtils";
import { fetchWithRetry, base64Encode, base64Decode,utf8ToBase64, base64ToUtf8 } from "./githubUtils";
import { ProgressData } from "~/stores/progressStore";

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
    await backupProgress(owner, repo, branch, token, progress);
    await backupBooks(owner, repo, branch, token, books);
    //)
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

async function backupProgress(
  owner: string, repo: string, branch: string, token: string, progressStore: Record<string, ProgressData>
) {
  const filePath = "progress/progress.json";
  const fileUrl = `${BASE_URL(owner, repo)}/${filePath}`;
  const existingFile = await fetch(fileUrl, { headers: HEADERS(token) });
  let sha = null;
  let existingProgress: Record<string, ProgressData> = {};

  if (existingFile.ok) {
    const fileData = await existingFile.json();
    sha = fileData.sha;

    try {
      // const existingContent = Buffer.from(fileData.content, "base64").toString("utf-8");
      let base64Content = fileData.content.replace(/\s/g, ""); // Trim whitespace
      base64Content += "=".repeat((4 - (base64Content.length % 4)) % 4); // Fix padding
      const existingContent = base64ToUtf8(base64Content).replace(/[\u0000-\u001F]/g, "");
      existingProgress = JSON.parse(existingContent); // Decode base64 JSON
    } catch (error) {
      console.error("Failed to decode existing progress.json", error);
    }
  }

  // 2️⃣ Merge current `progressStore` with `existingProgress`
  const mergedProgress = { ...existingProgress, ...progressStore };
  const jsonString = JSON.stringify(mergedProgress);
  const content = utf8ToBase64(jsonString); // Encode as base64

  // 3️⃣ Upload merged `books.json`
  await fetchWithRetry(fileUrl, {
    method: "PUT",
    headers: HEADERS(token),
    body: JSON.stringify({ message: `Backup ${filePath}`, content, branch, sha }),
  });
}

export async function getRepoSize(owner: string, repo: string, token: string): Promise<number | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(url, { headers: { Authorization: `token ${token}` } });

  // if (!response.ok) throw new Error(`Failed to fetch repo metadata: ${response.status}`);
  if (!response.ok) return null;

  const data = await response.json();
  return data.size * 1024; // GitHub returns size in KB, convert to bytes
}

export async function getBackupRepo(owner: string, token: string): Promise<string> {
  let repoNumber = 1;

  while (true) {
    const repoName = `books-backup-${repoNumber}`;
    const repoSize = await getRepoSize(owner, repoName, token);

    if (!repoSize) {
      console.log(`Repo ${repoName} does not exist. Creating new.`);
      // await createRepo(owner, token);
      return repoName;
    }

    if (repoSize < 4.8 * 1024 * 1024 * 1024) {
      console.log(`Using ${repoName}, size: ${(repoSize / (1024 * 1024)).toFixed(2)} MB`);
      return repoName;
    }

    repoNumber++; // Check the next repo
  }
}

async function createRepo(repo: string, token: string) {
  const url = `https://api.github.com/user/repos`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: HEADERS(token),
    body: JSON.stringify({
      name: repo,
      private: true,
      description: "Backup repository for books data",
    }),
  });

  if (!response.ok) throw new Error(`Failed to create repo ${repo}: ${response.statusText}`);
  console.log(`Created new repo: ${repo}`);
}

export async function getBackupIndex(owner: string, token: string): Promise<Record<string, string>> {
  const url = `${BASE_URL(owner, "books-backup-index")}/index.json`;
  
  const response = await fetch(url, { headers: HEADERS(token) });

  if (response.ok) {
    const fileData = await response.json();
    return JSON.parse(base64Decode(fileData.content));
  }

  return {}; // Return empty if index doesn't exist
}

async function updateBackupIndex(
  owner: string, 
  token: string, 
  newMappings: Record<string, string>
) {
  const index = await getBackupIndex(owner, token);
  const updatedIndex = { ...index, ...newMappings };

  const jsonString = JSON.stringify(updatedIndex);
  const content = base64Encode(jsonString);
  
  const url = `${BASE_URL(owner, "books-backup-index")}/index.json`;

  await fetchWithRetry(url, {
    method: "PUT",
    headers: HEADERS(token),
    body: JSON.stringify({ message: "Update index.json", content }),
  });

  console.log("Updated books-backup-index.");
}


// import { readAsBinaryString } from "react-native-fs";

// async function uploadEpubInChunks(owner: string, repo: string, bookId: string, filePath: string, token: string) {
//   const chunkSize = 4 * 1024 * 1024; // 4MB per chunk
//   const fileSize = (await stat(filePath)).size;
//   const totalChunks = Math.ceil(fileSize / chunkSize);
  
//   for (let i = 0; i < totalChunks; i++) {
//     const offset = i * chunkSize;
//     const chunk = await readAsBinaryString(filePath, offset, chunkSize);
//     const content = base64Encode(chunk);

//     const chunkPath = `epubs/${bookId}_part${i}.epub`;
//     const url = `${BASE_URL(owner, repo)}/${chunkPath}`;

//     await fetchWithRetry(url, {
//       method: "PUT",
//       headers: HEADERS(token),
//       body: JSON.stringify({ message: `Upload chunk ${i}`, content }),
//     });

//     console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);
//   }
// }



