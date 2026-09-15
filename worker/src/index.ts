/** Keep the existing { k, p } KV format and 30-day expiration. */
export interface WorkerEnv extends Env { DODO_API_KEY?: string }
const MAX_PAYLOAD_BYTES = 200_000;
const MAX_BODY_BYTES = MAX_PAYLOAD_BYTES + 1024;
const TTL_SECONDS = 30 * 24 * 60 * 60;
type Kind = "json" | "bundle" | "curl" | "curlcmd";
interface StoredLink { k: Kind; p: string }

function isKind(value: unknown): value is Kind {
  return value === "json" || value === "bundle" || value === "curl" || value === "curlcmd";
}
function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400", Vary: "Origin",
  };
}
function jsonResponse(body: unknown, status: number, origin: string): Response {
  return Response.json(body, { status, headers: corsHeaders(origin) });
}
function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]!);
}
function redirectHtml(target: string, kind: Kind, siteUrl: string): string {
  const label = { json: "JSON", bundle: "JSON Bundle", curl: "cURL Response", curlcmd: "cURL Command" }[kind];
  const title = `JSON Prism — Shared ${label}`;
  const description = `A shared ${label} document. Open it in JSON Prism in your browser.`;
  // JSON.stringify alone cannot escape script end tags, including in legacy KV values.
  const targetJson = JSON.stringify(target).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:type" content="website"><meta property="og:site_name" content="JSON Prism">
<meta property="og:image" content="${htmlEscape(siteUrl)}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${htmlEscape(siteUrl)}/og-image.png">
<meta http-equiv="refresh" content="0; url=${htmlEscape(target)}">
<script>window.location.replace(${targetJson});</script>
</head><body><p>Loading shared JSON… <a href="${htmlEscape(target)}">Continue</a></p></body></html>`;
}
function notFoundHtml(siteUrl: string): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Link expired — JSON Prism</title></head>
<body><h1>Link expired or not found</h1><p>Short links expire after 30 days.</p>
<p><a href="${htmlEscape(siteUrl)}">Open JSON Prism</a></p></body></html>`, {
    status: 404, headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

class BodyTooLarge extends Error {}
async function readJson(body: ReadableStream<Uint8Array> | null, contentLength?: string | null): Promise<unknown> {
  if (Number(contentLength) > MAX_BODY_BYTES) throw new BodyTooLarge();
  if (!body) throw new SyntaxError("Missing body");
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new BodyTooLarge(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes));
}
async function limited(req: Request, binding: RateLimit, prefix: string): Promise<boolean> {
  // Cloudflare supplies the IP header; local callers share a development bucket.
  return !(await binding.limit({ key: `${prefix}:${req.headers.get("CF-Connecting-IP") || "local"}` })).success;
}
async function handlePost(req: Request, env: WorkerEnv): Promise<Response> {
  const origin = env.ALLOWED_ORIGIN;
  // Browser API: Origin is an anti-abuse check, not authentication.
  if (req.headers.get("Origin") !== origin) return jsonResponse({ error: "forbidden" }, 403, origin);
  if (req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return jsonResponse({ error: "unsupported_media_type" }, 415, origin);
  }
  if (await limited(req, env.SHORT_LINK_RATE_LIMITER, "short")) return jsonResponse({ error: "rate_limited" }, 429, origin);
  let body: unknown;
  try { body = await readJson(req.body, req.headers.get("Content-Length")); }
  catch (error) {
    return jsonResponse(error instanceof BodyTooLarge
      ? { error: "payload_too_large", limit: MAX_PAYLOAD_BYTES }
      : { error: "invalid_json" }, error instanceof BodyTooLarge ? 413 : 400, origin);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return jsonResponse({ error: "invalid_body" }, 400, origin);
  const { kind, payload } = body as { kind?: unknown; payload?: unknown };
  if (!isKind(kind)) return jsonResponse({ error: "invalid_kind" }, 400, origin);
  if (typeof payload !== "string" || !payload.length) return jsonResponse({ error: "missing_payload" }, 400, origin);
  if (new TextEncoder().encode(payload).byteLength > MAX_PAYLOAD_BYTES) {
    return jsonResponse({ error: "payload_too_large", limit: MAX_PAYLOAD_BYTES }, 413, origin);
  }
  if (!/^[A-Za-z0-9~+\-_$=/]+$/.test(payload)) return jsonResponse({ error: "invalid_payload" }, 400, origin);
  const record: StoredLink = { k: kind, p: payload };
  for (let attempt = 0; attempt < 5; attempt++) {
    // 96 random bits: KV read-before-write is not an atomic uniqueness check.
    const slug = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
    if (await env.SHORT_LINKS.get(slug) !== null) continue;
    await env.SHORT_LINKS.put(slug, JSON.stringify(record), { expirationTtl: TTL_SECONDS });
    return jsonResponse({ slug, url: `${new URL(req.url).origin}/${slug}`, expiresInSeconds: TTL_SECONDS }, 201, origin);
  }
  return jsonResponse({ error: "slug_exhausted" }, 503, origin);
}
async function handleDonate(req: Request, env: WorkerEnv): Promise<Response> {
  if (!env.DODO_API_KEY || !env.DODO_DONATE_PRODUCT_ID || !["live_mode", "test_mode"].includes(env.DODO_ENVIRONMENT)) {
    return new Response("Donations are not configured for this environment.", { status: 503 });
  }
  if (await limited(req, env.DONATE_RATE_LIMITER, "donate")) return new Response("Please try again shortly.", { status: 429 });
  const host = env.DODO_ENVIRONMENT === "live_mode" ? "live.dodopayments.com" : "test.dodopayments.com";
  try {
    const res = await fetch(`https://${host}/checkouts`, {
      method: "POST", signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${env.DODO_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ product_cart: [{ product_id: env.DODO_DONATE_PRODUCT_ID, quantity: 1 }], return_url: env.SITE_URL }),
    });
    if (!res.ok) { await res.body?.cancel(); throw new Error("Checkout failed"); }
    const data = await readJson(res.body, res.headers.get("Content-Length"));
    if (!data || typeof data !== "object" || !("checkout_url" in data) || typeof data.checkout_url !== "string") throw new Error("Invalid checkout");
    const checkout = new URL(data.checkout_url);
    if (checkout.protocol !== "https:" || checkout.username || checkout.password) throw new Error("Invalid checkout URL");
    return Response.redirect(checkout.href, 302);
  } catch { return new Response("Unable to start checkout. Please try again shortly.", { status: 502 }); }
}
async function route(req: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(req.url);
  const origin = env.ALLOWED_ORIGIN;
  const isPostPath = url.pathname === "/s" || url.pathname === "/s/";
  if (req.method === "OPTIONS" && isPostPath) {
    if (req.headers.get("Origin") !== origin) return jsonResponse({ error: "forbidden" }, 403, origin);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method === "POST" && isPostPath) return handlePost(req, env);
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD, POST, OPTIONS" } });
  }
  if (url.pathname === "/health") return jsonResponse({ ok: true }, 200, origin);
  const siteUrl = env.SITE_URL.replace(/\/+$/, "");
  if (url.pathname === "/") return Response.redirect(siteUrl, 302);
  if (url.pathname === "/donate" || url.pathname === "/donate/") {
    // Link checks must not create checkout sessions.
    return req.method === "HEAD" ? new Response(null, { status: 200 }) : handleDonate(req, env);
  }
  const slug = url.pathname.slice(1);
  if (!/^[A-Za-z0-9]{1,24}$/.test(slug)) return notFoundHtml(siteUrl);
  const raw = await env.SHORT_LINKS.get(slug);
  if (!raw) return notFoundHtml(siteUrl);
  let record: StoredLink;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("k" in parsed) || !("p" in parsed) || !isKind(parsed.k) || typeof parsed.p !== "string") throw new Error("Invalid record");
    record = { k: parsed.k, p: parsed.p };
  } catch { return notFoundHtml(siteUrl); }
  const target = `${siteUrl}/${record.k === "bundle" ? "bundle/" : ""}#${record.k}=${record.p}`;
  return new Response(redirectHtml(target, record.k, siteUrl), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
export default {
  async fetch(req: Request, env: WorkerEnv): Promise<Response> {
    let response: Response;
    try { response = await route(req, env); }
    catch {
      // Never log payloads, checkout credentials, or IP addresses.
      response = jsonResponse({ error: "service_unavailable" }, 503, env.ALLOWED_ORIGIN);
    }
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.set("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    if (response.status === 429) headers.set("Retry-After", "60");
    return new Response(req.method === "HEAD" ? null : response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<WorkerEnv>;
