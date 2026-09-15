import { expect, it } from "vitest";
import redirect from "./index.mjs";

it("canonicalizes www while preserving paths and query parameters", () => {
  const response = redirect.fetch(new Request("https://www.jsonprism.com/tools/json-formatter/?tool=formatter"));
  expect(response.status).toBe(308);
  expect(response.headers.get("Location")).toBe("https://jsonprism.com/tools/json-formatter/?tool=formatter");
});
