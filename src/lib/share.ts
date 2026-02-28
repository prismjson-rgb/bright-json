import LZString from "lz-string";

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
