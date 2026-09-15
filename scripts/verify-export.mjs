import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

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

const renderedTextExtensions = new Set([".html", ".txt", ".js", ".css", ".svg", ".json", ".xml"]);
const emDashPattern = /\u2014|&mdash;|&#(?:8212|x2014);/gi;
let checkedTextFiles = 0;
let allowedEditorRules = 0;
function verifyRenderedText(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) {
      verifyRenderedText(filename);
    } else if (entry.isFile() && renderedTextExtensions.has(extname(filename))) {
      const text = readFileSync(filename, "utf8");
      for (const match of text.matchAll(emDashPattern)) {
        // TipTap's horizontal-rule input pattern accepts the character as a delimiter;
        // it does not display it in website copy.
        const isEditorInputRule = extname(filename) === ".js" && text.slice(Math.max(0, match.index - 18), match.index + 18).includes("find:/^(?:---|\u2014-|___");
        assert.ok(isEditorInputRule, `Em dash found in exported asset ${filename}`);
        allowedEditorRules += 1;
      }
      checkedTextFiles += 1;
    }
  }
}
verifyRenderedText("out");
console.log(`Verified ${routes.length} exported routes, sitemap, 404, headers, robots, manifest, and ${checkedTextFiles} text assets with no visible em-dash copy (${allowedEditorRules} editor input rule allowed).`);
