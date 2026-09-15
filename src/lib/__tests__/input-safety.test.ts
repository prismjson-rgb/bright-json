import { describe, expect, it } from "vitest";
import { encodeJson, decodeBundle, decodeBundleAsync, decodeCurlShare } from "../share";
import { sortObjectKeys } from "../../hooks/useJsonParser";
import { collapseDepth, removeKeys } from "../json-trim";
import { jsonToCsv } from "../json-to-csv";

describe("untrusted share input", () => {
  it.each([null, {}, [null], [{ title: "x" }], [{ title: {}, json: "{}" }]])("rejects invalid bundle shape %j", async (value) => {
    const encoded = encodeJson(JSON.stringify(value));
    expect(decodeBundle(encoded)).toEqual([]);
    expect(await decodeBundleAsync(encoded)).toEqual([]);
  });
  it("rejects an invalid cURL share", async () => {
    expect(await decodeCurlShare(encodeJson('{"curl":"abc","json":"{}","meta":null}'))).toBeNull();
  });
});
describe("JSON property preservation", () => {
  const input = JSON.parse('{"__proto__":{"value":1},"constructor":"kept","normal":2}');
  it("retains special keys when sorting", () => {
    expect(JSON.parse(JSON.stringify(sortObjectKeys(input)))).toEqual(input);
  });
  it("retains special keys when trimming", () => {
    expect(JSON.parse(JSON.stringify(removeKeys(input, ["missing"])))).toEqual(input);
    expect(JSON.parse(JSON.stringify(collapseDepth(input, 5)))).toEqual(input);
  });
  it("retains a primitive __proto__ key in CSV", () => {
    expect(jsonToCsv([JSON.parse('{"__proto__":"kept"}')])).toBe("__proto__\nkept");
  });
});
