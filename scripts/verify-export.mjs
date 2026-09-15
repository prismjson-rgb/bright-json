import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";

const routes = ["", "app", "bundle", "tools", "learn", "learn/errors"];
for (const [directory, prefix] of [["pages", ""], ["tools", "tools/"], ["learn", "learn/"]]) {
  for (const file of readdirSync(`content/${directory}`)) {
    if (file.endsWith(".md") && file !== "README.md") routes.push(prefix + file.slice(0, -3));
  }
}
for (const route of routes) assert.ok(existsSync(`out/${route ? `${route}/` : ""}index.html`), `Missing route /${route}`);
for (const file of ["404.html", "sitemap.xml", "robots.txt", "_headers", "manifest.json", "deployment.json"]) assert.ok(existsSync(`out/${file}`), `Missing ${file}`);
const sitemap = readFileSync("out/sitemap.xml", "utf8");
for (const route of routes.filter((r) => r !== "app")) assert.ok(sitemap.includes(`${route}/</loc>`), `Missing sitemap route ${route}`);
console.log(`Verified ${routes.length} exported routes, sitemap, 404, headers, robots, and manifest.`);
