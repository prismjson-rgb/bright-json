/**
 * Client for the Cloudflare Worker short-link service.
 *
 * The feature is gated on `NEXT_PUBLIC_SHORTENER_URL` — if unset, the UI
 * should not render the "Create short link" action at all, so forks and
 * self-hosters who don't want any server-side storage get a clean build.
 */

const SHORTENER_URL = process.env.NEXT_PUBLIC_SHORTENER_URL;

export type ShortKind = "json" | "bundle" | "curl" | "curlcmd";

export interface ShortLinkSuccess {
  ok: true;
  slug: string;
  url: string;
  expiresInSeconds: number;
}

export type ShortLinkError =
  | { ok: false; code: "not-configured" }
  | { ok: false; code: "too-large"; limit: number }
  | { ok: false; code: "network" }
  | { ok: false; code: "aborted" }
  | { ok: false; code: "server"; status: number };

export type ShortLinkResult = ShortLinkSuccess | ShortLinkError;

export function isShortLinkConfigured(): boolean {
  return typeof SHORTENER_URL === "string" && SHORTENER_URL.length > 0;
}

/** Strips the `#json=`, `#bundle=`, or `#curl=` hash off a full share URL and
 *  returns the kind + raw payload. Returns null for unrecognised formats. */
export function extractSharePayload(
  shareUrl: string,
): { kind: ShortKind; payload: string } | null {
  try {
    const u = new URL(shareUrl);
    if (u.hash.startsWith("#json=")) {
      return { kind: "json", payload: u.hash.slice("#json=".length) };
    }
    if (u.hash.startsWith("#bundle=")) {
      return { kind: "bundle", payload: u.hash.slice("#bundle=".length) };
    }
    if (u.hash.startsWith("#curl=")) {
      return { kind: "curl", payload: u.hash.slice("#curl=".length) };
    }
    if (u.hash.startsWith("#curlcmd=")) {
      return { kind: "curlcmd", payload: u.hash.slice("#curlcmd=".length) };
    }
  } catch {
    // fall through
  }
  return null;
}

export async function createShortLink(
  kind: ShortKind,
  payload: string,
  signal?: AbortSignal,
): Promise<ShortLinkResult> {
  if (!SHORTENER_URL) return { ok: false, code: "not-configured" };

  let res: Response;
  try {
    res = await fetch(`${SHORTENER_URL}/s`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") {
      return { ok: false, code: "aborted" };
    }
    return { ok: false, code: "network" };
  }

  if (res.status === 413) {
    const body = (await res.json().catch(() => ({}))) as { limit?: number };
    return { ok: false, code: "too-large", limit: body.limit ?? 0 };
  }
  if (!res.ok) {
    return { ok: false, code: "server", status: res.status };
  }

  const body = (await res.json()) as {
    slug: string;
    url: string;
    expiresInSeconds: number;
  };
  return {
    ok: true,
    slug: body.slug,
    url: body.url,
    expiresInSeconds: body.expiresInSeconds,
  };
}
