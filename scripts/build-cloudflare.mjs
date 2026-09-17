import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Derive all public URLs from the production API configuration.
const config = JSON.parse(readFileSync(new URL("../worker/wrangler.jsonc", import.meta.url), "utf8")).env.production;
const serviceUrl = `https://${config.routes[0].pattern}`;
const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: config.vars.SITE_URL,
  NEXT_PUBLIC_SHORTENER_URL: serviceUrl,
  NEXT_PUBLIC_DONATE_URL: `${serviceUrl}/donate`,
};
for (const args of [["scripts/generate-content.cjs"], ["scripts/generate-openapi.mjs"], ["node_modules/wrangler/bin/wrangler.js", "types", "edge/worker-configuration.d.ts"], ["node_modules/next/dist/bin/next", "build"]]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const sha = process.env.GITHUB_SHA || spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout?.trim() || "local";
writeFileSync("out/deployment.json", JSON.stringify({ environment: "production", sha, builtAt: new Date().toISOString() }) + "\n");
