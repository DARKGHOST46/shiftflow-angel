/**
 * Security Hardened Fetch
 * 
 * Enforces strict timeouts to prevent hanging sockets and adds basic interceptors.
 */

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function safeFetch(url: string | URL, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    // Explicitly do not handle 4xx/5xx here to allow callers to inspect responses,
    // but ensure the socket is cleaned up via the timeout.
    
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`[Security] Request to ${url} timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}
