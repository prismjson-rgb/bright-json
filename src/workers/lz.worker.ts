/// <reference lib="webworker" />
import LZString from "lz-string";

type Op = "encode-uri-component" | "decompress-uri-component";

interface Request {
  id: number;
  op: Op;
  payload: string;
}

interface Response {
  id: number;
  ok: boolean;
  result?: string | null;
  error?: string;
}

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", (e: MessageEvent<Request>) => {
  const { id, op, payload } = e.data;
  const reply = (r: Response) => ctx.postMessage(r);
  try {
    if (op === "encode-uri-component") {
      reply({ id, ok: true, result: LZString.compressToEncodedURIComponent(payload) });
    } else if (op === "decompress-uri-component") {
      reply({ id, ok: true, result: LZString.decompressFromEncodedURIComponent(payload) });
    } else {
      reply({ id, ok: false, error: `unknown op: ${op as string}` });
    }
  } catch (err) {
    reply({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

export {};
