import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type WorkerEnv } from "../src/index";

function setup() {
  const records = new Map<string, string>();
  const put = vi.fn(async (key: string, value: string) => { records.set(key, value); });
  const env = {
    SITE_URL: "https://staging.jsonprism.com",
    ALLOWED_ORIGIN: "https://staging.jsonprism.com",
    DODO_ENVIRONMENT: "test_mode", DODO_DONATE_PRODUCT_ID: "",
    SHORT_LINKS: { get: vi.fn(async (key: string) => records.get(key) ?? null), put },
    SHORT_LINK_RATE_LIMITER: { limit: vi.fn(async () => ({ success: true })) },
    DONATE_RATE_LIMITER: { limit: vi.fn(async () => ({ success: true })) },
  } as unknown as WorkerEnv;
  const post = (body: unknown, headers: Record<string, string> = {}) => worker.fetch(new Request("https://s-staging.jsonprism.com/s", {
    method: "POST", headers: { Origin: env.ALLOWED_ORIGIN, "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
  }), env);
  return { env, records, put, post };
}
afterEach(() => vi.unstubAllGlobals());
describe("short-link Worker", () => {
  it.each(["json", "bundle", "curl", "curlcmd"])("round trips %s on the requesting host", async (kind) => {
    const { post, env, put } = setup();
    const created = await post({ kind, payload: "~abc_123-Z" });
    expect(created.status).toBe(201);
    const data = await created.json() as { slug: string; url: string; expiresInSeconds: number };
    expect(data.url).toBe(`https://s-staging.jsonprism.com/${data.slug}`);
    expect(data.slug).toMatch(/^[a-f0-9]{24}$/);
    expect(data.expiresInSeconds).toBe(2592000);
    expect(put).toHaveBeenCalledWith(data.slug, JSON.stringify({ k: kind, p: "~abc_123-Z" }), { expirationTtl: 2592000 });
    const opened = await worker.fetch(new Request(data.url), env);
    expect(opened.status).toBe(200);
    expect(await opened.text()).toContain(`${env.SITE_URL}/${kind === "bundle" ? "bundle/" : ""}#${kind}=~abc_123-Z`);
    expect(opened.headers.get("Cache-Control")).toBe("no-store");
  });
  it("keeps six-character legacy links working and escapes stored script end tags", async () => {
    const { env, records } = setup();
    records.set("Ab12Cd", JSON.stringify({ k: "json", p: '</script ><script>alert(1)</script>' }));
    const response = await worker.fetch(new Request("https://short.test/Ab12Cd"), env);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).not.toContain("</script >");
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html).toContain("\\u003c/script >");
  });
  it.each([null, [], 1, "value", {}, { kind: "unknown", payload: "abc" }, { kind: "json", payload: "<script>" }])("rejects malformed input %j", async (input) => {
    const { post, put } = setup();
    expect((await post(input)).status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });
  it("rejects wrong origins and non-JSON requests", async () => {
    const { post } = setup();
    expect((await post({}, { Origin: "https://other.test" })).status).toBe(403);
    expect((await post({}, { "Content-Type": "text/plain" })).status).toBe(415);
  });
  it("enforces a streaming body limit without Content-Length", async () => {
    const { post, put } = setup();
    expect((await post({ kind: "json", payload: "a".repeat(210_000) })).status).toBe(413);
    expect(put).not.toHaveBeenCalled();
  });
  it("enforces the payload limit in bytes", async () => {
    const { post } = setup();
    expect((await post({ kind: "json", payload: "é".repeat(100_001) })).status).toBe(413);
  });
  it("rate limits writes before touching KV", async () => {
    const { env, post, put } = setup();
    vi.mocked(env.SHORT_LINK_RATE_LIMITER.limit).mockResolvedValue({ success: false });
    const response = await post({ kind: "json", payload: "abc" });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(put).not.toHaveBeenCalled();
  });
  it("serves health and preflight without KV writes", async () => {
    const { env, put } = setup();
    expect((await worker.fetch(new Request("https://short.test/health"), env)).status).toBe(200);
    const response = await worker.fetch(new Request("https://short.test/s", { method: "OPTIONS", headers: { Origin: env.ALLOWED_ORIGIN } }), env);
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(env.ALLOWED_ORIGIN);
    expect(put).not.toHaveBeenCalled();
  });
  it.each(["null", "{}", "not json"])("handles corrupt stored records: %s", async (raw) => {
    const { env, records } = setup();
    records.set("Ab12Cd", raw);
    expect((await worker.fetch(new Request("https://short.test/Ab12Cd"), env)).status).toBe(404);
  });
  it("returns a controlled service failure when KV fails", async () => {
    const { env, post } = setup();
    vi.mocked(env.SHORT_LINKS.get).mockRejectedValue(new Error("KV unavailable"));
    expect((await post({ kind: "json", payload: "abc" })).status).toBe(503);
  });
});
describe("donations", () => {
  it("does not contact payments when unconfigured or requested with HEAD", async () => {
    const { env } = setup();
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect((await worker.fetch(new Request("https://short.test/donate"), env)).status).toBe(503);
    expect((await worker.fetch(new Request("https://short.test/donate", { method: "HEAD" }), env)).status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["not json", JSON.stringify({ checkout_url: "javascript:alert(1)" }), "null"])("handles invalid checkout responses", async (body) => {
    const { env } = setup(); env.DODO_API_KEY = "test-only"; env.DODO_DONATE_PRODUCT_ID = "test-product";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body)));
    expect((await worker.fetch(new Request("https://short.test/donate"), env)).status).toBe(502);
  });
  it("redirects to a fresh test checkout without caching", async () => {
    const { env } = setup(); env.DODO_API_KEY = "test-only"; env.DODO_DONATE_PRODUCT_ID = "test-product";
    const fetch = vi.fn(async () => Response.json({ checkout_url: "https://checkout.dodopayments.com/test" }));
    vi.stubGlobal("fetch", fetch);
    const response = await worker.fetch(new Request("https://short.test/donate"), env);
    expect(response.status).toBe(302);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetch.mock.calls[0][0]).toBe("https://test.dodopayments.com/checkouts");
  });
});
