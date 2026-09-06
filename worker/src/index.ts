/**
 * JSON Prism short-link Worker.
 *
 *   POST /s                → stores an already-encoded payload in KV, returns a slug
 *   GET  /<slug>           → 302 redirects to https://jsonprism.com/#json=~<payload>
 *                            (or /bundle/#bundle=~<payload> for bundles)
 *   GET  /                 → soft redirect to the main site
 *   OPTIONS /s             → CORS preflight
 *
 * Security posture:
 *   - CORS locked to ALLOWED_ORIGIN (no `*`). Prevents random sites from
 *     using this Worker as a free URL shortener.
 *   - Origin header also checked on POST (browsers always send it for
 *     cross-origin fetches). Not a real auth check, just an anti-abuse speed bump.
 *   - Payloads are capped at 200 KB. Stored value includes only the compressed
 *     share payload — we never see the user's original JSON.
 *
 * KV expiration is handled by `expirationTtl: 2592000` (30 days). No cron needed.
 */

interface Env {
  SHORT_LINKS: KVNamespace;
  SITE_URL: string;
  ALLOWED_ORIGIN: string;
  /** Dodo Payments secret API key. Set via `wrangler secret put DODO_API_KEY` — never in wrangler.toml. */
  DODO_API_KEY: string;
  /** "test_mode" or "live_mode" — selects which Dodo API host to call. */
  DODO_ENVIRONMENT: string;
  /** Product ID (pdt_...) of the pay-what-you-want donation product in the Dodo dashboard. */
  DODO_DONATE_PRODUCT_ID: string;
}

const MAX_PAYLOAD_BYTES = 200_000;
const TTL_SECONDS = 30 * 24 * 60 * 60;
const SLUG_LENGTH = 6;
const SLUG_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_RETRIES = 5;

type Kind = "json" | "bundle" | "curl" | "curlcmd";

interface StoredLink {
  k: Kind;
  p: string;
}

function generateSlug(): string {
  const bytes = new Uint8Array(SLUG_LENGTH);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  origin: string,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

function htmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}

/** HTML page served on successful slug hits.
 *
 *  Why not a 302? Many social-card scrapers (Slack, Discord, Twitter, iMessage)
 *  either don't follow redirects or follow them and land on the site root,
 *  where the OG tags describe the app generically instead of "a shared JSON".
 *  Returning HTML directly gives us tailored OG tags AND still bounces real
 *  browsers to the target via meta-refresh + JS — all while preserving the
 *  fragment that holds the payload. */
function redirectHtml(target: string, kind: Kind, siteUrl: string): string {
  const title = kind === "bundle"
    ? "JSON Prism — Shared JSON Bundle"
    : kind === "curl"
    ? "JSON Prism — Shared cURL Response"
    : kind === "curlcmd"
    ? "JSON Prism — Shared cURL Command"
    : "JSON Prism — Shared JSON";
  const description = kind === "bundle"
    ? "A bundle of JSON documents shared via JSON Prism. Opens locally in your browser — nothing is uploaded."
    : kind === "curl"
    ? "A cURL request and its JSON response shared via JSON Prism. Opens locally in your browser — nothing is uploaded."
    : kind === "curlcmd"
    ? "A cURL command shared via JSON Prism. Opens ready to run — nothing is uploaded."
    : "A JSON document shared via JSON Prism. Opens locally in your browser — nothing is uploaded.";
  const image = `${siteUrl}/og-image.png`;
  const safeTarget = htmlEscape(target);
  const safeSite = htmlEscape(siteUrl);
  const safeImage = htmlEscape(image);
  const targetJson = JSON.stringify(target);

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${safeSite}/">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${safeSite}/">
<meta property="og:site_name" content="JSON Prism">
<meta property="og:type" content="website">
<meta property="og:image" content="${safeImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="JSON Prism — format, validate, diff, and explore JSON in your browser">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${safeImage}">

<meta http-equiv="refresh" content="0; url=${safeTarget}">
<script>window.location.replace(${targetJson});</script>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 12vh auto; padding: 0 1rem; line-height: 1.5; color: #555; }
  @media (prefers-color-scheme: dark) { body { color: #aaa; background: #0d1117; } }
  a { color: #06b6d4; text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
</style>
</head><body>
<p>Loading shared JSON… <a href="${safeTarget}">Continue →</a></p>
</body></html>`;
}

function notFoundHtml(siteUrl: string): Response {
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Link expired — JSON Prism</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 12vh auto; padding: 0 1rem; line-height: 1.5; color: #1a1a1a; }
  @media (prefers-color-scheme: dark) { body { color: #e8e8e8; background: #0d1117; } }
  h1 { font-size: 1.5rem; margin-bottom: .5rem; }
  p { color: #555; }
  @media (prefers-color-scheme: dark) { p { color: #aaa; } }
  a { color: #06b6d4; text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
</style>
</head><body>
<h1>Link expired or not found</h1>
<p>Short links live for 30 days, then are automatically deleted. This one's gone — or the slug was mistyped.</p>
<p><a href="${siteUrl}">Open JSON Prism →</a></p>
</body></html>`;
  return new Response(html, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handlePost(req: Request, env: Env): Promise<Response> {
  const origin = env.ALLOWED_ORIGIN;

  const reqOrigin = req.headers.get("Origin");
  if (reqOrigin && reqOrigin !== origin) {
    return jsonResponse({ error: "forbidden" }, 403, origin);
  }

  const contentLength = Number(req.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_PAYLOAD_BYTES + 1024) {
    return jsonResponse(
      { error: "payload_too_large", limit: MAX_PAYLOAD_BYTES },
      413,
      origin,
    );
  }

  let body: { kind?: unknown; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400, origin);
  }

  if (body.kind !== "json" && body.kind !== "bundle" && body.kind !== "curl" && body.kind !== "curlcmd") {
    return jsonResponse({ error: "invalid_kind" }, 400, origin);
  }
  if (typeof body.payload !== "string" || body.payload.length === 0) {
    return jsonResponse({ error: "missing_payload" }, 400, origin);
  }
  if (body.payload.length > MAX_PAYLOAD_BYTES) {
    return jsonResponse(
      { error: "payload_too_large", limit: MAX_PAYLOAD_BYTES },
      413,
      origin,
    );
  }

  const record: StoredLink = { k: body.kind, p: body.payload };
  const serialized = JSON.stringify(record);

  let slug = "";
  for (let attempt = 0; attempt < SLUG_RETRIES; attempt++) {
    const candidate = generateSlug();
    const existing = await env.SHORT_LINKS.get(candidate);
    if (existing === null) {
      slug = candidate;
      break;
    }
  }
  if (!slug) {
    return jsonResponse({ error: "slug_exhausted" }, 503, origin);
  }

  await env.SHORT_LINKS.put(slug, serialized, { expirationTtl: TTL_SECONDS });

  const shortUrl = `https://s.jsonprism.com/${slug}`;
  return jsonResponse(
    { slug, url: shortUrl, expiresInSeconds: TTL_SECONDS },
    201,
    origin,
  );
}

/**
 * GET /donate → creates a fresh Dodo Payments checkout session for the
 * pay-what-you-want donation product and 302s straight to it. Sessions are
 * single-use and expire in 24h, so this must be generated per-visit rather
 * than linking to a static checkout URL.
 */
async function handleDonate(env: Env): Promise<Response> {
  const apiBase = env.DODO_ENVIRONMENT === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";

  let res: Response;
  try {
    res = await fetch(`${apiBase}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: env.DODO_DONATE_PRODUCT_ID, quantity: 1 }],
        return_url: env.SITE_URL,
      }),
    });
  } catch {
    return new Response("Unable to reach the payment provider. Please try again shortly.", { status: 502 });
  }

  if (!res.ok) {
    return new Response("Unable to start checkout. Please try again shortly.", { status: 502 });
  }

  const data = await res.json() as { checkout_url?: string | null };
  if (!data.checkout_url) {
    return new Response("Unable to start checkout. Please try again shortly.", { status: 502 });
  }

  return Response.redirect(data.checkout_url, 302);
}

async function handleGet(url: URL, env: Env): Promise<Response> {
  if (url.pathname === "/" || url.pathname === "") {
    return Response.redirect(env.SITE_URL, 302);
  }

  if (url.pathname === "/donate" || url.pathname === "/donate/") {
    return handleDonate(env);
  }

  const slug = url.pathname.slice(1);
  if (!/^[A-Za-z0-9]{1,16}$/.test(slug)) {
    return notFoundHtml(env.SITE_URL);
  }

  const raw = await env.SHORT_LINKS.get(slug);
  if (!raw) return notFoundHtml(env.SITE_URL);

  let record: StoredLink;
  try {
    record = JSON.parse(raw) as StoredLink;
  } catch {
    return notFoundHtml(env.SITE_URL);
  }

  const target =
    record.k === "bundle"
      ? `${env.SITE_URL}/bundle/#bundle=${record.p}`
      : record.k === "curl"
      ? `${env.SITE_URL}/#curl=${record.p}`
      : record.k === "curlcmd"
      ? `${env.SITE_URL}/#curlcmd=${record.p}`
      : `${env.SITE_URL}/#json=${record.p}`;

  return new Response(redirectHtml(target, record.k, env.SITE_URL), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = env.ALLOWED_ORIGIN;

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (req.method === "POST" && (url.pathname === "/s" || url.pathname === "/s/")) {
      return handlePost(req, env);
    }

    if (req.method === "GET") {
      return handleGet(url, env);
    }

    return new Response("method not allowed", {
      status: 405,
      headers: { Allow: "GET, POST, OPTIONS", ...corsHeaders(origin) },
    });
  },
};
