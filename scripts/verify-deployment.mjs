import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../worker/wrangler.jsonc", import.meta.url), "utf8")).env.production;
const site = config.vars.SITE_URL;
for (const path of ["/", "/tools/json-formatter/", "/learn/what-is-json/", "/bundle/", "/privacy/", "/sitemap.xml"]) {
  const res = await fetch(site + path, { signal: AbortSignal.timeout(20_000) });
  assert.equal(res.status, 200, `${path}: HTTP ${res.status}`);
  await res.body?.cancel();
}
const missing = await fetch(`${site}/__deployment_missing_page__/`, { signal: AbortSignal.timeout(20_000) });
assert.equal(missing.status, 404, "Unknown routes must return 404");
await missing.body?.cancel();
const health = await fetch(`https://${config.routes[0].pattern}/health`, { signal: AbortSignal.timeout(20_000) });
assert.equal(health.status, 200, "Short-link health failed");
assert.equal((await health.json()).ok, true);
const marker = await fetch(`${site}/deployment.json`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
assert.equal(marker.status, 200, "Deployment marker missing");
const deployed = await marker.json();
assert.equal(deployed.environment, "production");
if (process.env.GITHUB_SHA) assert.equal(deployed.sha, process.env.GITHUB_SHA, "Live revision differs from the validated commit");
const canonical = await fetch("https://www.jsonprism.com/tools/json-formatter/?deployment=check", { redirect: "manual", signal: AbortSignal.timeout(20_000) });
assert.equal(canonical.status, 308);
assert.equal(canonical.headers.get("location"), `${site}/tools/json-formatter/?deployment=check`);
await canonical.body?.cancel();
console.log(`Production smoke checks passed; deployed commit ${deployed.sha}. No checkout sessions or short links were created.`);
