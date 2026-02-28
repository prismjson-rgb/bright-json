function escapeXml(val: string): string {
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
  return /^\d/.test(clean) ? `_${clean}` : clean || "item";
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
    const inner = Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => valueToXml(v, k, indent + "  "))
      .join("\n");
    return `${indent}<${t}>\n${inner}\n${indent}</${t}>`;
  }
  return `${indent}<${t}>${String(val)}</${t}>`;
}

export function jsonToXml(parsed: unknown, rootTag = "root"): string {
  try {
    const header = `<?xml version="1.0" encoding="UTF-8"?>`;
    if (Array.isArray(parsed)) {
      const items = parsed
        .map((item) => valueToXml(item, "item", "  "))
        .join("\n");
      return `${header}\n<${rootTag}>\n${items}\n</${rootTag}>`;
    }
    if (typeof parsed === "object" && parsed !== null) {
      const inner = Object.entries(parsed as Record<string, unknown>)
        .map(([k, v]) => valueToXml(v, k, "  "))
        .join("\n");
      return `${header}\n<${rootTag}>\n${inner}\n</${rootTag}>`;
    }
    return `${header}\n<${rootTag}>${escapeXml(String(parsed))}</${rootTag}>`;
  } catch (e) {
    return `<!-- Error converting to XML: ${e instanceof Error ? e.message : String(e)} -->`;
  }
}
