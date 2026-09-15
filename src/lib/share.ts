import { decodeBoundedLz } from "./bounded-lz";
import { MAX_INPUT_CHARS } from "./input-limits";
import LZString from "lz-string";
import { lzEncodeAsync, lzDecodeAsync } from "./lz-worker-client";
import { compressToBase64Url, decompressFromBase64Url } from "./compress-stream";

const MAX_SAFE_URL = 2000;

// Prefix marker for the new deflate-raw+base64url format. Legacy lz-string
// payloads contain only [A-Za-z0-9+-$_], never `~`, so presence of the marker
// unambiguously identifies the new encoding.
const V2_MARKER = "~";

export function encodeJson(json: string): string {
  if (json.length > MAX_INPUT_CHARS) throw new Error("Share exceeds the input limit.");
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeJson(encoded: string): string | null {
  return decodeBoundedLz(encoded);
}

export interface BundleEntry {
  title: string;
  json: string;
}

function parseBundle(raw: string): BundleEntry[] {
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || value.length > 50 || !value.every((entry) => entry && typeof entry === "object" && typeof entry.title === "string" && typeof entry.json === "string")) return [];
  return value;
}

export function encodeBundle(entries: BundleEntry[]): string {
  return encodeJson(JSON.stringify(entries));
}

export function decodeBundle(encoded: string): BundleEntry[] {
  try {
    const raw = decodeBoundedLz(encoded);
    if (!raw) return [];
    return parseBundle(raw);
  } catch {
    return [];
  }
}

export function isTooLarge(url: string): boolean {
  return url.length > MAX_SAFE_URL;
}

/** Tries lz-string first, falls back to btoa for old links */
export function safeDecodeJson(encoded: string): string | null {
  if (encoded.length > MAX_INPUT_CHARS * 2) return null;
  // Try lz-string
  try {
    const lz = decodeBoundedLz(encoded);
    if (lz && lz.length > 0) return lz;
  } catch {}
  // Fall back to old btoa encoding
  try {
    const raw = decodeURIComponent(escape(atob(encoded)));
    return raw.length <= MAX_INPUT_CHARS ? raw : null;
  } catch {}
  return null;
}

/* ── Async variants (deflate-raw primary, lz-string fallback) ─────────────── */
// deflate-raw via browser CompressionStream produces links ~30–60% shorter than
// lz-string on realistic JSON (measured — see scripts/compare-compression.mjs).

export async function encodeJsonAsync(json: string): Promise<string> {
  try {
    return V2_MARKER + (await compressToBase64Url(json));
  } catch {
    // CompressionStream unavailable — fall back to worker-backed lz-string.
    const viaWorker = await lzEncodeAsync(json).catch(() => null);
    return viaWorker ?? encodeJson(json);
  }
}

export async function encodeBundleAsync(entries: BundleEntry[]): Promise<string> {
  const serialized = JSON.stringify(entries);
  try {
    return V2_MARKER + (await compressToBase64Url(serialized));
  } catch {
    const viaWorker = await lzEncodeAsync(serialized).catch(() => null);
    return viaWorker ?? encodeJson(serialized);
  }
}

export async function decodeBundleAsync(encoded: string): Promise<BundleEntry[]> {
  try {
    const raw = await decodeAnyAsync(encoded);
    if (!raw) return [];
    return parseBundle(raw);
  } catch {
    return [];
  }
}

export async function safeDecodeJsonAsync(encoded: string): Promise<string | null> {
  return decodeAnyAsync(encoded);
}

/* ── cURL share ──────────────────────────────────────────────────────────── */

export interface CurlSharePayload {
  curl: string;
  json: string;
  meta: {
    method: string;
    url: string;
    status: number;
    statusText: string;
    responseHeaders: Record<string, string>;
    timing: number;
  };
}

export async function encodeCurlShare(payload: CurlSharePayload): Promise<string> {
  const serialized = JSON.stringify(payload);
  try {
    return V2_MARKER + (await compressToBase64Url(serialized));
  } catch {
    const viaWorker = await lzEncodeAsync(serialized).catch(() => null);
    return viaWorker ?? encodeJson(serialized);
  }
}

export async function decodeCurlShare(encoded: string): Promise<CurlSharePayload | null> {
  try {
    const raw = await decodeAnyAsync(encoded);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || typeof value.curl !== "string" || typeof value.json !== "string" ||
      !value.meta || typeof value.meta !== "object" || typeof value.meta.method !== "string" || typeof value.meta.url !== "string" ||
      typeof value.meta.status !== "number" || typeof value.meta.statusText !== "string" || typeof value.meta.timing !== "number" ||
      !value.meta.responseHeaders || typeof value.meta.responseHeaders !== "object" || Array.isArray(value.meta.responseHeaders) ||
      !Object.values(value.meta.responseHeaders).every((header) => typeof header === "string")) return null;
    return value as CurlSharePayload;
  } catch {
    return null;
  }
}

/* ── cURL command-only share (no response) ───────────────────────────────── */

export async function encodeCurlCmd(command: string): Promise<string> {
  try {
    return V2_MARKER + (await compressToBase64Url(command));
  } catch {
    const viaWorker = await lzEncodeAsync(command).catch(() => null);
    return viaWorker ?? encodeJson(command);
  }
}

export async function decodeCurlCmd(encoded: string): Promise<string | null> {
  return decodeAnyAsync(encoded);
}

async function decodeAnyAsync(encoded: string): Promise<string | null> {
  if (encoded.startsWith(V2_MARKER)) {
    try {
      const out = await decompressFromBase64Url(encoded.slice(V2_MARKER.length));
      if (out) return out;
    } catch {}
    return null;
  }
  // Legacy lz-string payload.
  try {
    const viaWorker = await lzDecodeAsync(encoded).catch(() => null);
    if (viaWorker && viaWorker.length > 0) return viaWorker;
  } catch {}
  return safeDecodeJson(encoded);
}
