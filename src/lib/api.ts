import { safeFetch } from "./fetch";

export function getApiUrl(): string | null {
  const isTauri =
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI_METADATA__" in window);
  const isDev = import.meta.env.DEV;

  if (isTauri) {
    if (isDev) {
      return "http://127.0.0.1:8080/api/hakim";
    }
    // Require explicit backend URL in Tauri production
    const url = import.meta.env.VITE_API_URL;
    if (!url) return null;
    return url.replace(/\/$/, "") + "/api/hakim";
  }

  // Web build or dev server uses same-origin routes
  return "/api/hakim";
}

export async function checkBackendHealth(): Promise<{
  reachable: boolean;
  status: number | null;
  url: string | null;
}> {
  const url = getApiUrl();
  if (!url) {
    return { reachable: false, status: null, url: null };
  }

  try {
    const res = await safeFetch(url, {
      method: "OPTIONS",
      timeoutMs: 3000,
    });
    return { reachable: true, status: res.status, url };
  } catch (e) {
    return { reachable: false, status: null, url };
  }
}
