/** Max response body size when loading JSON from a URL (characters). */
const MAX_CHARS = 12_000_000;

export function parseHttpUrlOrThrow(input: string): URL {
  const raw = input.trim();
  if (!raw) throw new Error("Enter a URL");
  let url: URL;
  try {
    url = /^https?:\/\//i.test(raw) ? new URL(raw) : new URL(`https://${raw}`);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }
  return url;
}

export function tabLabelFromFetchedUrl(url: URL): string {
  const path = url.pathname.replace(/\/$/, "") || "";
  const base = path ? `${url.hostname}${path}` : url.hostname;
  return base.length > 60 ? `${base.slice(0, 57)}…` : base;
}

/**
 * GET request from the browser. Many third-party APIs block cross-origin calls (CORS);
 * in that case fetch fails and the user sees an error toast.
 */
export async function fetchTextViaGet(
  urlInput: string,
  signal?: AbortSignal,
): Promise<{ text: string; label: string }> {
  const url = parseHttpUrlOrThrow(urlInput);
  const res = await fetch(url.href, {
    method: "GET",
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    signal,
    headers: { Accept: "application/json, text/plain;q=0.9, */*;q=0.8" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`);
  }
  const text = await res.text();
  if (text.length > MAX_CHARS) {
    throw new Error(`Response too large (max ${Math.round(MAX_CHARS / 1e6)} MB)`);
  }
  return { text, label: tabLabelFromFetchedUrl(url) };
}
