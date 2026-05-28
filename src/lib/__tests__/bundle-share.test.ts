import { describe, it, expect } from "vitest";
import { encodeBundle, decodeBundle } from "../share";
import type { BundleEntry } from "../share";

// ---------------------------------------------------------------------------
// encodeBundle / decodeBundle — title preservation
// ---------------------------------------------------------------------------

describe("encodeBundle / decodeBundle — round-trip", () => {
  it("preserves titles and json for each entry", () => {
    const entries: BundleEntry[] = [
      { title: "Deal Recommmdation Schema", json: '{"id":1}' },
      { title: "Multi CFT request", json: '{"req":true}' },
      { title: "Multi CFT response", json: '{"res":true}' },
    ];
    const encoded = encodeBundle(entries);
    const decoded = decodeBundle(encoded);
    expect(decoded).toHaveLength(3);
    expect(decoded[0].title).toBe("Deal Recommmdation Schema");
    expect(decoded[0].json).toBe('{"id":1}');
    expect(decoded[1].title).toBe("Multi CFT request");
    expect(decoded[2].title).toBe("Multi CFT response");
  });

  it("preserves empty title", () => {
    const entries: BundleEntry[] = [{ title: "", json: "null" }];
    const decoded = decodeBundle(encodeBundle(entries));
    expect(decoded[0].title).toBe("");
  });

  it("preserves titles with special characters", () => {
    const title = "POST /api/v2 — héllo wörld & more";
    const entries: BundleEntry[] = [{ title, json: "{}" }];
    const decoded = decodeBundle(encodeBundle(entries));
    expect(decoded[0].title).toBe(title);
  });

  it("returns empty array for corrupt input", () => {
    expect(decodeBundle("not-valid-encoded-data")).toEqual([]);
    expect(decodeBundle("")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// URL construction — title → ?name= query param
// ---------------------------------------------------------------------------

function buildEntryUrl(title: string, encodedJson: string): string {
  const titleParam = title ? `?name=${encodeURIComponent(title)}` : "";
  return `/${titleParam}#json=${encodedJson}`;
}

describe("bundle entry URL construction", () => {
  it("includes ?name= when title is present", () => {
    const url = buildEntryUrl("Multi CFT request", "abc123");
    expect(url).toBe("/?name=Multi%20CFT%20request#json=abc123");
  });

  it("omits ?name= when title is empty string", () => {
    const url = buildEntryUrl("", "abc123");
    expect(url).toBe("/#json=abc123");
  });

  it("encodes special characters in the title", () => {
    const url = buildEntryUrl("A & B / C", "abc");
    expect(url).toContain("A%20%26%20B%20%2F%20C");
    expect(url).toContain("#json=abc");
  });

  it("title survives a URLSearchParams round-trip", () => {
    const title = "Deal Recommmdation Schema";
    const url = buildEntryUrl(title, "xyz");
    // Simulate how JsonViewerClient reads it: extract search string before the hash
    const searchStr = url.split("#")[0].replace(/^\//, "");
    const params = new URLSearchParams(searchStr);
    expect(params.get("name")).toBe(title);
  });
});

// ---------------------------------------------------------------------------
// URL parsing — JsonViewerClient reads ?name= from window.location.search
// ---------------------------------------------------------------------------

describe("URL name param parsing", () => {
  function parseName(search: string): string | null {
    return new URLSearchParams(search).get("name");
  }

  it("extracts name from ?name=<title>", () => {
    expect(parseName("?name=Multi%20CFT%20request")).toBe("Multi CFT request");
  });

  it("returns null when ?name= is absent (legacy #json= URL)", () => {
    expect(parseName("")).toBeNull();
    expect(parseName("?tool=diff")).toBeNull();
  });

  it("handles names with special characters", () => {
    const title = "POST /api — response";
    const search = `?name=${encodeURIComponent(title)}`;
    expect(parseName(search)).toBe(title);
  });

  it("round-trips every bundle entry title via URL encoding", () => {
    const titles = [
      "Deal Recommmdation Schema",
      "Multi CFT request",
      "Multi CFT response",
      "Untitled 1",
      "POST api.enc.groupon.com/v3/deals",
    ];
    for (const title of titles) {
      const url = buildEntryUrl(title, "x");
      const searchStr = url.split("#")[0].replace(/^\//, "");
      expect(parseName(searchStr)).toBe(title);
    }
  });
});
