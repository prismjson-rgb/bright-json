/**
 * URL shortening with multi-provider fallback, in-memory cache, and abort support.
 *
 * Providers are tried in order until one returns a URL strictly shorter than the input.
 * All providers must be CORS-friendly and require no API key.
 */

const MAX_SHORTENER_LENGTH = 5000;

const cache = new Map<string, string>();

export type ShortenReason = "ok" | "too-large" | "all-failed" | "aborted";

export interface ShortenResult {
  shortUrl: string | null;
  reason: ShortenReason;
}

type Provider = (url: string, signal?: AbortSignal) => Promise<string | null>;

async function shortenViaIsGd(url: string, signal?: AbortSignal): Promise<string | null> {
  const res = await fetch(
    `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
    { signal, headers: { Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { shorturl?: string; errorcode?: number };
  if (data.errorcode) return null;
  return typeof data.shorturl === "string" ? data.shorturl : null;
}

async function shortenViaVGd(url: string, signal?: AbortSignal): Promise<string | null> {
  const res = await fetch(
    `https://v.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
    { signal, headers: { Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { shorturl?: string; errorcode?: number };
  if (data.errorcode) return null;
  return typeof data.shorturl === "string" ? data.shorturl : null;
}

async function shortenViaCleanUri(url: string, signal?: AbortSignal): Promise<string | null> {
  const res = await fetch("https://cleanuri.com/api/v1/shorten", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `url=${encodeURIComponent(url)}`,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result_url?: string; error?: string };
  if (data.error) return null;
  return typeof data.result_url === "string" ? data.result_url : null;
}

const PROVIDERS: Provider[] = [shortenViaIsGd, shortenViaVGd, shortenViaCleanUri];

export function isShortenable(url: string): boolean {
  return url.length <= MAX_SHORTENER_LENGTH;
}

export async function shortenUrl(url: string, signal?: AbortSignal): Promise<ShortenResult> {
  if (!isShortenable(url)) return { shortUrl: null, reason: "too-large" };

  const cached = cache.get(url);
  if (cached) return { shortUrl: cached, reason: "ok" };

  for (const provider of PROVIDERS) {
    if (signal?.aborted) return { shortUrl: null, reason: "aborted" };
    try {
      const short = await provider(url, signal);
      if (short && short.length < url.length) {
        cache.set(url, short);
        return { shortUrl: short, reason: "ok" };
      }
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        return { shortUrl: null, reason: "aborted" };
      }
      // try next provider
    }
  }
  return { shortUrl: null, reason: "all-failed" };
}
