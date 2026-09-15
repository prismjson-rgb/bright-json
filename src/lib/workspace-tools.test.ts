import { expect, it } from "vitest";
import { MODES } from "./modes";
import { TOOL_LAUNCH_CONFIG } from "./tool-links";
import { DEFAULT_FAVOURITES, parseFavourites, TOOL_GROUPS, workspaceTool } from "./workspace-tools";

it("exposes every launchable tool exactly once and preserves existing mode help and icons", () => {
  const slugs = TOOL_GROUPS.flatMap(group => group.slugs);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect([...slugs].sort()).toEqual(Object.keys(TOOL_LAUNCH_CONFIG).sort());
  for (const slug of slugs) {
    const tool = workspaceTool(slug);
    if (tool.mode) {
      expect(tool.help).toBe(MODES[tool.mode].help);
      if (slug !== "json-formatter" && slug !== "json-validator") expect(tool.icon).toBe(MODES[tool.mode].icon);
    }
  }
});

it("accepts an intentionally empty favourites list and filters stale or duplicate entries", () => {
  expect(parseFavourites(null)).toEqual(DEFAULT_FAVOURITES);
  expect(parseFavourites("[]")).toEqual([]);
  expect(parseFavourites('["json-debugger","__proto__","json-debugger",null]')).toEqual(["json-debugger"]);
  expect(parseFavourites("broken")).toEqual(DEFAULT_FAVOURITES);
});
