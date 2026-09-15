function escapeXml(val: string): string {
  for (const char of val) {
    const code = char.codePointAt(0)!;
    if (!(code === 9 || code === 10 || code === 13 || (code >= 0x20 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xfffd) || (code >= 0x10000 && code <= 0x10ffff))) {
      throw new Error("JSON contains a character that XML 1.0 cannot represent.");
    }
  }
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toXmlTag(tag: string): string {
  // Ensure tag is valid XML — replace spaces/special chars with underscore
  const clean = tag.replace(/[^a-zA-Z0-9_.-]/g, "_");
  // XML tags can't start with a digit
  return clean ? (/^[a-zA-Z_]/.test(clean) ? clean : `_${clean}`) : "item";
}

function valueToXml(val: unknown, tag: string, indent: string): string {
  const t = toXmlTag(tag);
  if (val === null) {
    return `${indent}<${t} xsi:nil="true" />`;
  }
  if (typeof val === "boolean" || typeof val === "number") {
    return `${indent}<${t}>${val}</${t}>`;
  }
  if (typeof val === "string") {
    return `${indent}<${t}>${escapeXml(val)}</${t}>`;
  }
  if (Array.isArray(val)) {
    const inner = val
      .map((item) => valueToXml(item, "item", indent + "  "))
      .join("\n");
    return `${indent}<${t}>\n${inner}\n${indent}</${t}>`;
  }
  if (typeof val === "object" && val !== null) {
    const names = Object.keys(val).map(toXmlTag);
    if (new Set(names).size !== names.length) throw new Error("JSON keys collide after XML name normalization. Rename the keys before exporting.");
    const inner = Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => valueToXml(v, k, indent + "  "))
      .join("\n");
    return `${indent}<${t}>\n${inner}\n${indent}</${t}>`;
  }
  return `${indent}<${t}>${String(val)}</${t}>`;
}

export function jsonToXml(parsed: unknown, rootTag = "root"): string {
  const tag = toXmlTag(rootTag);
  const body = valueToXml(parsed, tag, "").replace(`<${tag}`, `<${tag} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
}
