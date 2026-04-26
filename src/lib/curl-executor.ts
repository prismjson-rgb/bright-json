import { parseCurl, labelFromCurlRequest, type CurlRequest } from "./curl-parser";

export type { CurlRequest } from "./curl-parser";
export { parseCurl, labelFromCurlRequest };

const MAX_BODY_CHARS = 12_000_000;

export interface CurlResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: number;
}

export async function executeCurl(req: CurlRequest, signal?: AbortSignal): Promise<CurlResponse> {
  const t0 = Date.now();
  const res = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body !== undefined ? req.body : undefined,
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    signal,
  });

  const body = await res.text();
  const timing = Date.now() - t0;

  if (body.length > MAX_BODY_CHARS) {
    throw new Error(`Response too large (max ${Math.round(MAX_BODY_CHARS / 1e6)} MB)`);
  }

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => { headers[key] = value; });

  return { status: res.status, statusText: res.statusText, headers, body, timing };
}
