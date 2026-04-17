/**
 * Client for the lz-string Web Worker. Provides async compress/decompress
 * so large JSON payloads don't block the main thread.
 *
 * Falls back silently (returns null) if workers aren't available (SSR, Safari
 * with disabled module workers, etc.) — callers handle the sync fallback.
 */

type Op = "encode-uri-component" | "decompress-uri-component";

interface WorkerResponse {
  id: number;
  ok: boolean;
  result?: string | null;
  error?: string;
}

let workerInstance: Worker | null = null;
let workerDisabled = false;
let nextId = 1;
const pending = new Map<
  number,
  { resolve: (v: string | null) => void; reject: (err: Error) => void }
>();

function getWorker(): Worker | null {
  if (workerDisabled) return null;
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (workerInstance) return workerInstance;
  try {
    workerInstance = new Worker(
      new URL("../workers/lz.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerInstance.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
      const { id, ok, result, error } = e.data;
      const handler = pending.get(id);
      if (!handler) return;
      pending.delete(id);
      if (ok) handler.resolve(result ?? null);
      else handler.reject(new Error(error ?? "lz worker error"));
    });
    workerInstance.addEventListener("error", () => {
      for (const { reject } of pending.values()) reject(new Error("lz worker crashed"));
      pending.clear();
      workerInstance?.terminate();
      workerInstance = null;
      workerDisabled = true;
    });
    return workerInstance;
  } catch {
    workerDisabled = true;
    return null;
  }
}

function post(op: Op, payload: string): Promise<string | null> {
  const w = getWorker();
  if (!w) return Promise.resolve(null);
  const id = nextId++;
  return new Promise<string | null>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, op, payload });
  });
}

export function lzEncodeAsync(str: string): Promise<string | null> {
  return post("encode-uri-component", str);
}

export function lzDecodeAsync(encoded: string): Promise<string | null> {
  return post("decompress-uri-component", encoded);
}
