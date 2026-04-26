export interface CurlRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/** Tokenize shell input: handles single/double quotes and backslash-newline continuations. */
function tokenize(input: string): string[] {
  const src = input.replace(/\\\r?\n/g, " ");
  const tokens: string[] = [];
  let i = 0;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;
    let token = "";
    while (i < src.length && !/\s/.test(src[i])) {
      const ch = src[i];
      if (ch === "'") {
        i++;
        while (i < src.length && src[i] !== "'") token += src[i++];
        if (i < src.length) i++;
      } else if (ch === '"') {
        i++;
        while (i < src.length && src[i] !== '"') {
          if (src[i] === '\\' && i + 1 < src.length) {
            i++;
            const esc = src[i];
            token += (esc === '"' || esc === '\\' || esc === '$' || esc === '`' || esc === '\n')
              ? esc
              : '\\' + esc;
            i++;
          } else {
            token += src[i++];
          }
        }
        if (i < src.length) i++;
      } else if (ch === '\\') {
        i++;
        if (i < src.length) token += src[i++];
      } else {
        token += src[i++];
      }
    }
    if (token) tokens.push(token);
  }
  return tokens;
}

// Flags that take no value (safe to skip)
const NO_VALUE_FLAGS = new Set([
  "-v", "--verbose", "-s", "--silent", "-S", "--show-error",
  "-L", "--location", "-k", "--insecure", "--compressed",
  "-f", "--fail", "--http2", "--http1.1", "--http1.0",
  "--no-keepalive", "--digest", "--ntlm", "--no-buffer",
  "--globoff", "-g", "--progress-bar", "#",
  "-i", "--include", "-I", "--head",
  "--anyauth", "--basic", "--negotiate",
  "--no-alpn", "--no-npn", "--tcp-nodelay",
  "-N", "--no-buffer", "--tr-encoding",
  "--path-as-is", "--false-start",
]);

// Flags whose next token is a value we ignore
const VALUE_FLAGS_IGNORED = new Set([
  "-o", "--output", "-O", "--remote-name",
  "--max-time", "-m", "--connect-timeout",
  "--limit-rate", "--retry",
  "--proxy", "-x", "--cert", "--key",
  "--cacert", "--capath", "--resolve",
  "--interface",
  "-A", "--user-agent",
  "-e", "--referer",
  "--cookie", "-b", "--cookie-jar", "-c",
  "--dns-servers", "--doh-url",
]);

export function parseCurl(input: string): CurlRequest {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Empty curl command");

  const tokens = tokenize(trimmed);
  if (tokens[0]?.toLowerCase() !== "curl") throw new Error('Command must start with "curl"');
  tokens.shift();

  const headers: Record<string, string> = {};
  let method: string | undefined;
  let url: string | undefined;
  let body: string | undefined;
  let forceGet = false;

  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];

    if (t === "-X" || t === "--request") {
      method = tokens[i + 1]?.toUpperCase();
      i += 2;
    } else if (t === "-H" || t === "--header") {
      const hdr = tokens[i + 1] ?? "";
      const colon = hdr.indexOf(":");
      if (colon > 0) headers[hdr.slice(0, colon).trim()] = hdr.slice(colon + 1).trim();
      i += 2;
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary" || t === "--data-ascii") {
      let val = tokens[i + 1] ?? "";
      if (val.startsWith("@")) val = val.slice(1); // @file — treat remainder as literal
      body = val;
      i += 2;
    } else if (t === "--json") {
      body = tokens[i + 1] ?? "";
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      headers["Accept"] = headers["Accept"] ?? "application/json";
      i += 2;
    } else if (t === "-u" || t === "--user") {
      const creds = tokens[i + 1] ?? "";
      try {
        headers["Authorization"] = "Basic " + btoa(unescape(encodeURIComponent(creds)));
      } catch {
        headers["Authorization"] = "Basic " + btoa(creds);
      }
      i += 2;
    } else if (t === "--oauth2-bearer") {
      headers["Authorization"] = "Bearer " + (tokens[i + 1] ?? "");
      i += 2;
    } else if (t === "-G" || t === "--get") {
      forceGet = true;
      i++;
    } else if (t === "--url") {
      url = tokens[i + 1];
      i += 2;
    } else if (NO_VALUE_FLAGS.has(t)) {
      i++;
    } else if (VALUE_FLAGS_IGNORED.has(t)) {
      i += 2;
    } else if (/^-[a-zA-Z]{2,}$/.test(t)) {
      // Combined short flags like -sL — skip; if any need a value, also skip next token
      const needsValue = /[XHduobecmxA]/.test(t.slice(1));
      i += needsValue ? 2 : 1;
    } else if (!t.startsWith("-")) {
      if (!url) url = t;
      i++;
    } else {
      // Unknown flag: skip flag + potential value
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith("-")) i += 2;
      else i++;
    }
  }

  if (!method) method = forceGet ? "GET" : body !== undefined ? "POST" : "GET";
  if (!url) throw new Error("No URL found in curl command");

  if (!/^https?:\/\//i.test(url)) {
    if (url.includes("://")) throw new Error("Only http(s) URLs are supported");
    url = "https://" + url;
  }

  return { url, method, headers, body };
}

export function labelFromCurlRequest(req: Pick<CurlRequest, "url" | "method">): string {
  try {
    const u = new URL(req.url);
    const path = u.pathname.replace(/\/$/, "") || "";
    const base = path ? `${u.hostname}${path}` : u.hostname;
    const label = `${req.method} ${base}`;
    return label.length > 60 ? label.slice(0, 57) + "…" : label;
  } catch {
    return `${req.method} request`;
  }
}
