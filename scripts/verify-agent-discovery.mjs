import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3000";
const get = (path, init) => fetch(new URL(path, base), { ...init, signal: AbortSignal.timeout(15000) });
const html = await get("/");
assert.equal(html.status, 200);
assert.match(html.headers.get("content-type"), /text\/html/);
assert.match(html.headers.get("vary"), /Accept/i);
for (const relation of ["api-catalog", "service-desc", "service-doc", "describedby"]) assert.ok(html.headers.get("link")?.includes(`rel="${relation}"`));
await html.body.cancel();
for (const path of ["/", "/tools/", "/learn/", "/learn/errors/", "/tools/json-formatter/"]) {
  const markdown = await get(path, { headers: { Accept: "text/markdown" } });
  assert.equal(markdown.status, 200, path);
  assert.match(markdown.headers.get("content-type"), /text\/markdown/);
  assert.match(await markdown.text(), /^# /);
}
const declined = await get("/", { headers: { Accept: "text/markdown;q=0, text/html" } });
assert.match(declined.headers.get("content-type"), /text\/html/);
await declined.body.cancel();
const catalog = await get("/.well-known/api-catalog");
assert.equal(catalog.status, 200);
assert.match(catalog.headers.get("content-type"), /application\/linkset\+json/);
const data = await catalog.json();
assert.ok(data.linkset.some(entry => entry["service-desc"] && entry["service-doc"]));
const head = await get("/.well-known/api-catalog", { method: "HEAD" });
assert.equal(head.status, 200);
assert.match(head.headers.get("link"), /rel="api-catalog"/);
assert.equal(await head.text(), "");
for (const path of ["/auth.md", "/api.md"]) {
  const response = await get(path);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/markdown/);
  assert.match(await response.text(), /^# /);
}
assert.equal((await (await get("/openapi.json")).json()).openapi, "3.1.0");
assert.match(await (await get("/robots.txt")).text(), /Content-Signal: ai-train=no, search=yes, ai-input=no/);
assert.equal((await get("/nonexistent-agent-discovery-check/", { headers: { Accept: "text/markdown" } })).status, 404);
console.log(`Agent discovery HTTP checks passed for ${base}`);
