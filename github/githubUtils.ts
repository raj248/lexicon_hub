import * as SecureStore from "expo-secure-store";

import { decode as base64Decode, encode as base64Encode } from "base-64";

function utf8ToBase64(str: string): string {
  return base64Encode(new TextEncoder().encode(str).reduce((acc, byte) => acc + String.fromCharCode(byte), ""));
}
function base64ToUtf8(base64Str: string): string {
  return new TextDecoder().decode(Uint8Array.from(base64Decode(base64Str), (c:any) => c.charCodeAt(0)));
}
export { base64Encode, base64Decode, utf8ToBase64, base64ToUtf8};

export async function fetchWithRetry(url: string, options: any, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if (response.status === 403) {
      console.warn("Rate limit hit, retrying...");
      await new Promise((res) => setTimeout(res, delay * (i + 1))); // Exponential backoff
    } else {
      break;
    }
  }
  throw new Error(`GitHub API request failed: ${url}`);
}


// MMKV instance
const TOKEN_KEY = "GITHUB_PAT";

// Save token securely + cache in MMKV
export const setGitHubToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

// Retrieve token (from MMKV first for speed)
export const getGitHubToken = async () => {
  
  const secureToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return secureToken;
};

// Delete token (for logout)
export const deleteGitHubToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
