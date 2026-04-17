import LZString from "lz-string";
import { lzEncodeAsync, lzDecodeAsync } from "./lz-worker-client";

const MAX_SAFE_URL = 2000;

export function encodeJson(json: string): string {
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeJson(encoded: string): string | null {
  return LZString.decompressFromEncodedURIComponent(encoded);
}

export interface BundleEntry {
  title: string;
  json: string;
}

export function encodeBundle(entries: BundleEntry[]): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(entries));
}

export function decodeBundle(encoded: string): BundleEntry[] {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(encoded);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isTooLarge(url: string): boolean {
  return url.length > MAX_SAFE_URL;
}

/** Tries lz-string first, falls back to btoa for old links */
export function safeDecodeJson(encoded: string): string | null {
  // Try lz-string
  try {
    const lz = LZString.decompressFromEncodedURIComponent(encoded);
    if (lz && lz.length > 0) return lz;
  } catch {}
  // Fall back to old btoa encoding
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {}
  return null;
}

/* ── Async variants (Web Worker-backed, with sync fallback) ───────────────── */

export async function encodeJsonAsync(json: string): Promise<string> {
  const viaWorker = await lzEncodeAsync(json).catch(() => null);
  return viaWorker ?? encodeJson(json);
}

export async function encodeBundleAsync(entries: BundleEntry[]): Promise<string> {
  const serialized = JSON.stringify(entries);
  const viaWorker = await lzEncodeAsync(serialized).catch(() => null);
  return viaWorker ?? LZString.compressToEncodedURIComponent(serialized);
}

export async function decodeBundleAsync(encoded: string): Promise<BundleEntry[]> {
  try {
    const raw = (await lzDecodeAsync(encoded).catch(() => null))
      ?? LZString.decompressFromEncodedURIComponent(encoded);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function safeDecodeJsonAsync(encoded: string): Promise<string | null> {
  try {
    const lz = await lzDecodeAsync(encoded).catch(() => null);
    if (lz && lz.length > 0) return lz;
  } catch {}
  return safeDecodeJson(encoded);
}
