import { markdownPages, prefersMarkdown } from "./markdown";

const discoveryLinks = '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </api.md>; rel="service-doc"; type="text/markdown", </auth.md>; rel="describedby"; type="text/markdown"';

export default {
  async fetch(request: Request, env: Pick<Env, "ASSETS">): Promise<Response> {
    const url = new URL(request.url);
    const readable = request.method === "GET" || request.method === "HEAD";
    const canonicalPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    const markdown = readable ? markdownPages.get(canonicalPath) : undefined;
    let response: Response;
    if (markdown && prefersMarkdown(request.headers.get("Accept"))) {
      response = new Response(request.method === "HEAD" ? null : markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
          "Content-Signal": "ai-train=no, search=yes, ai-input=no",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "X-Frame-Options": "DENY",
        },
      });
    } else {
      response = await env.ASSETS.fetch(request);
    }
    const headers = new Headers(response.headers);
    if (markdown) {
      const vary = headers.get("Vary");
      if (!vary?.split(",").some(v => ["accept", "*"].includes(v.trim().toLowerCase()))) {
        headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
      }
    }
    if (url.pathname === "/" || url.pathname === "/.well-known/api-catalog") headers.set("Link", discoveryLinks);
    if (response.status === 200 && url.pathname === "/.well-known/api-catalog") {
      headers.set("Content-Type", 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"');
    }
    if (response.status === 200 && ["/auth.md", "/api.md"].includes(url.pathname)) headers.set("Content-Type", "text/markdown; charset=utf-8");
    if (response.status === 200 && url.pathname === "/openapi.json") headers.set("Content-Type", "application/vnd.oai.openapi+json");
    return new Response(request.method === "HEAD" ? null : response.body, { status: response.status, statusText: response.statusText, headers });
  },
} satisfies ExportedHandler<Env>;
