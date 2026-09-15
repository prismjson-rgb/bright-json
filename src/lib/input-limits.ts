export const MAX_INPUT_CHARS = 1_000_000;
export const MAX_BODY_BYTES = 4_000_000;
export const MAX_JSON_DEPTH = 64;
export const MAX_JSON_TOKENS = 50_000;

/** Linear scan before parsing/recursive tools, including malformed input. */
export function assertInputBudget(text: string): void {
  if (text.length > MAX_INPUT_CHARS) throw new Error("Input exceeds the 1 million character processing limit. Split the document into smaller parts.");
  let depth = 0, tokens = 0, quoted = false, escaped = false;
  for (const char of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') { quoted = true; tokens++; }
    else if (char === "{" || char === "[") { depth++; tokens++; }
    else if (char === "}" || char === "]") depth--;
    else if (char === "," || char === ":") tokens++;
    if (depth > MAX_JSON_DEPTH) throw new Error("JSON exceeds the 64-level nesting limit.");
    if (tokens > MAX_JSON_TOKENS) throw new Error("JSON exceeds the processing work limit. Split the document into smaller parts.");
  }
}

/** Counts bytes while reading and cancels upstream on overflow, timeout or abort. */
export async function readBoundedText(stream: ReadableStream<Uint8Array> | null, signal?: AbortSignal, maxBytes = MAX_BODY_BYTES): Promise<string> {
  if (!stream) return "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  const chunks: string[] = [];
  let aborted = false;
  const abort = () => { aborted = true; void reader.cancel().catch(() => {}); };
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 30_000);
  try {
    if (signal?.aborted) abort();
    while (true) {
      const { done, value } = await reader.read();
      if (aborted) throw new Error("Reading cancelled or timed out.");
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error(`Response or expanded share exceeds the ${maxBytes / 1e6} MB limit.`);
      chunks.push(decoder.decode(value, { stream: true }));
    }
    chunks.push(decoder.decode());
    return chunks.join("");
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
    reader.releaseLock();
  }
}
