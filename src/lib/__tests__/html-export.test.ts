import { describe, expect, it } from "vitest";
import { generateHtml } from "../html-export";

describe("HTML export", () => {
  it.each(["</script><script>alert(1)</script>", "</script ><script>alert(1)</script>", "<!--<script>"])("escapes HTML parser control sequences in JSON: %s", (payload) => {
    const html = generateHtml(JSON.stringify({ payload }));
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain("\\u003c");
  });
});
