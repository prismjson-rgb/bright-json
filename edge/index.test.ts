import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import worker from "./index";
import { markdownPages, prefersMarkdown } from "./markdown";

function environment(status = 200, headers = {}) {
  const fetch = vi.fn(async () => new Response("<html>Browser page</html>", { status, headers: { "Content-Type": "text/html", Vary: "Origin", ...headers } }));
  const env: Pick<Env, "ASSETS"> = { ASSETS: { fetch, connect() { throw new Error("Unexpected socket connection"); } } };
  return { env, fetch };
}
describe("agent content negotiation", () => {
  it.each([
    [null, false], ["*/*", false], ["text/html", false], ["text/markdown", true],
    ["text/markdown;q=0", false], ["text/markdown;q=0.3,text/html;q=0.9", false],
    ["text/markdown;q=0.9,text/html;q=0.3", true], ["text/markdown, text/html", true],
    ["text/markdown;q=invalid", false], ["text/markdown;q=0.5,*/*;q=1", false],
  ])("negotiates %s", (accept, expected) => expect(prefersMarkdown(accept)).toBe(expected));
  it("serves real markdown for all editorial routes without fetching HTML", async () => {
    const { env, fetch } = environment();
    for (const [path, content] of markdownPages) {
      const res = await worker.fetch(new Request(`https://jsonprism.com${path}`, { headers: { Accept: "text/markdown" } }), env);
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("text/markdown");
      expect(res.headers.get("Vary")).toBe("Accept");
      expect(await res.text()).toBe(content);
      expect(content).not.toContain("{{toolCount}}");
    }
    expect(fetch).not.toHaveBeenCalled();
  });
  it("preserves browser responses, adds discovery and merges Vary", async () => {
    const { env } = environment();
    const res = await worker.fetch(new Request("https://jsonprism.com/"), env);
    expect(await res.text()).toContain("<html>");
    expect(res.headers.get("Vary")).toBe("Origin, Accept");
    for (const rel of ["api-catalog", "service-desc", "service-doc", "describedby"]) expect(res.headers.get("Link")).toContain(`rel="${rel}"`);
  });
  it("returns Markdown HEAD headers without a body", async () => {
    const { env } = environment();
    const res = await worker.fetch(new Request("https://jsonprism.com/", { method: "HEAD", headers: { Accept: "text/markdown" } }), env);
    expect(res.headers.get("Content-Type")).toContain("text/markdown");
    expect(await res.text()).toBe("");
  });
  it("does not turn missing routes into successful Markdown pages", async () => {
    const { env, fetch } = environment(404);
    const res = await worker.fetch(new Request("https://jsonprism.com/does-not-exist", { headers: { Accept: "text/markdown" } }), env);
    expect(res.status).toBe(404);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("does not replace a POST with a Markdown response", async () => {
    const { env, fetch } = environment(405);
    expect((await worker.fetch(new Request("https://jsonprism.com/", { method: "POST", headers: { Accept: "text/markdown" } }), env)).status).toBe(405);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("serves catalog HEAD discovery and the required media type", async () => {
    const { env } = environment();
    const res = await worker.fetch(new Request("https://jsonprism.com/.well-known/api-catalog", { method: "HEAD" }), env);
    expect(res.headers.get("Content-Type")).toContain("application/linkset+json");
    expect(res.headers.get("Link")).toContain('rel="api-catalog"');
    expect(await res.text()).toBe("");
  });
  it("catalog references existing documents and the implemented service", () => {
    const catalog = JSON.parse(readFileSync("public/.well-known/api-catalog", "utf8"));
    const api = catalog.linkset.find((entry: { anchor: string }) => entry.anchor === "https://s.jsonprism.com");
    for (const rel of ["service-desc", "service-doc"]) {
      expect(readFileSync(`public${new URL(api[rel][0].href).pathname}`, "utf8").length).toBeGreaterThan(0);
    }
    const spec = JSON.parse(readFileSync("public/openapi.json", "utf8"));
    expect(spec.servers[0].url).toBe(api.anchor);
    expect(Object.keys(spec.paths)).toEqual(["/s", "/{slug}", "/health", "/donate"]);
    expect(readFileSync("public/auth.md", "utf8")).toMatch(/^# .*auth.md/);
  });
});
