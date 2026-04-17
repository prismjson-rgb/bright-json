/**
 * URL-safe encoder/decoder using the browser-native CompressionStream API.
 *
 * "deflate-raw" is preferred — it has zero header/footer overhead, so it
 * produces the smallest output, which matters for URL fragments where every
 * byte shows up in the shared link.
 *
 * Output is base64url-encoded (`-` and `_` instead of `+` and `/`, no padding)
 * so the string is safe to drop into `window.location.hash` without escaping.
 */

export type CompressFormat = "deflate-raw" | "gzip" | "deflate";

export async function compressToBase64Url(
  input: string,
  format: CompressFormat = "deflate-raw",
): Promise<string> {
  const stream = new Blob([input]).stream().pipeThrough(new CompressionStream(format));
  const buf = await new Response(stream).arrayBuffer();
  return bufferToBase64Url(buf);
}

export async function decompressFromBase64Url(
  encoded: string,
  format: CompressFormat = "deflate-raw",
): Promise<string> {
  const bytes = base64UrlToBuffer(encoded);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  return await new Response(stream).text();
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(str: string): Uint8Array {
  const padded = str.padEnd(Math.ceil(str.length / 4) * 4, "=");
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
