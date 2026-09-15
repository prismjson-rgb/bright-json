import { parseCurl, labelFromCurlRequest, type CurlRequest } from "./curl-parser";

export type { CurlRequest } from "./curl-parser";
export { parseCurl, labelFromCurlRequest };

import { readBoundedText } from "./input-limits";

export interface CurlResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: number;
}

export async function executeCurl(req: CurlRequest, signal?: AbortSignal): Promise<CurlResponse> {
  const t0 = Date.now();
  signal = signal ? AbortSignal.any([signal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000);
  const res = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body !== undefined ? req.body : undefined,
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    signal,
  });

  const body = await readBoundedText(res.body, signal);
  const timing = Date.now() - t0;


  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => { headers[key] = value; });

  return { status: res.status, statusText: res.statusText, headers, body, timing };
}
