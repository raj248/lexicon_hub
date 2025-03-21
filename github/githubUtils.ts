import { btoa as base64Encode, atob as base64Decode } from "react-native-quick-base64";

export { base64Encode, base64Decode };

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
