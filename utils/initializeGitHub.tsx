// const GITHUB_USERNAME = "your-username";
// import { GITHUB_OWNER, GITHUB_REPO, BRANCH, TOKEN } from "@env"
import { useGitHubStore } from "~/github/githubStore";

const { owner, repo, branch, token } = useGitHubStore.getState();

const GITHUB_USERNAME = owner;
const INDEX_REPO = "books-backup-index";
const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${INDEX_REPO}`;

const HEADERS = {
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
  // "Content-Type": "application/json"
};

export async function checkOrCreateIndexRepo() {
  try {
    // Check if the repo exists
    const response = await fetch(BASE_URL, { headers: HEADERS });

    if (response.ok) {
      console.log("Index repository exists.");
      return;
    } else if (response.status === 404) {
      console.log("Index repository not found. Creating...");
    } else {
      throw new Error("Failed to check repository: " + response.statusText);
    }

    // Create the repository
    const createRepoResponse = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        name: INDEX_REPO,
        description: "Central index for book backup",
        private: true
      })
    });

    if (!createRepoResponse.ok) {
      throw new Error("Failed to create index repository");
    }

    console.log("Index repository created successfully.");
    await initializeIndexRepo();
  } catch (error) {
    console.error("Error in checkOrCreateIndexRepo:", error);
  }
}

async function initializeIndexRepo() {
  console.log("Initializing repository structure...");
  const folders = ["progress/", "books/", "watchlist/", "sha1/"];
  const emptyJson = JSON.stringify({});

  for (const folder of folders) {
    await createOrUpdateFile(folder + "placeholder.json", emptyJson);
  }

  console.log("Index repository initialized.");
}

async function createOrUpdateFile(path: string, content: string) {
  const fileUrl = `${BASE_URL}/contents/${path}`;
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  let sha = null;
  const existingFile = await fetch(fileUrl, { headers: HEADERS });
  if (existingFile.ok) {
    const fileData = await existingFile.json();
    sha = fileData.sha;
  }

  const response = await fetch(fileUrl, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify({
      message: `Initialize ${path}`,
      content: encodedContent,
      sha
    })
  });

  if (!response.ok) {
    console.error(`Failed to create/update ${path}`);
  } else {
    console.log(`${path} initialized.`);
  }
}

// Run the function
// checkOrCreateIndexRepo();
