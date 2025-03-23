
import { decode as base64Decode, encode as base64Encode } from "base-64";

// Properly encode UTF-8 to base64
function utf8ToBase64(str: string): string {
  return base64Encode(new TextEncoder().encode(str).reduce((acc, byte) => acc + String.fromCharCode(byte), ""));
}

// Properly decode base64 to UTF-8
function base64ToUtf8(base64Str: string): string {
  return new TextDecoder().decode(Uint8Array.from(base64Decode(base64Str), (c:any) => c.charCodeAt(0)));
}
export { base64Encode, base64Decode };
export { utf8ToBase64, base64ToUtf8 };

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
