function escapeCell(val: unknown, spreadsheetSafe: boolean): string {
  let str = val === null || val === undefined ? "" : String(val);
  if (spreadsheetSafe && typeof val === "string" && (/^\s*[=+@-]/.test(str) || /^[\t\r\n]/.test(str))) str = "'" + str;
  // Quote if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = Object.create(null);
  const assign = (key: string, value: unknown) => {
    if (Object.hasOwn(result, key)) throw new Error("JSON keys collide after CSV flattening. Rename dotted keys before exporting.");
    result[key] = value;
  };
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      for (const [nestedKey, nestedValue] of Object.entries(flattenObject(val as Record<string, unknown>, fullKey))) assign(nestedKey, nestedValue);
    } else if (Array.isArray(val)) {
      assign(fullKey, JSON.stringify(val));
    } else {
      assign(fullKey, val);
    }
  }
  return result;
}

export function jsonToCsv(parsed: unknown, spreadsheetSafe = true): string {
  if (!Array.isArray(parsed)) {
    return "CSV export requires a top-level JSON array of objects.\n\nExample:\n[\n  { \"name\": \"Alice\", \"age\": 30 },\n  { \"name\": \"Bob\", \"age\": 25 }\n]";
  }
  if (parsed.length === 0) {
    return "";
  }

  // Collect all unique headers from all rows
  const headerSet = new Set<string>();
  const flatRows = parsed.map((row) => {
    if (row !== null && typeof row === "object" && !Array.isArray(row)) {
      const flat = flattenObject(row as Record<string, unknown>);
      Object.keys(flat).forEach((k) => headerSet.add(k));
      return flat;
    }
    headerSet.add("value");
    return { value: row };
  });

  const headers = Array.from(headerSet);
  if (headers.length * flatRows.length > 100_000) throw new Error("CSV exceeds the 100,000 cell limit.");
  const csvRows = [
    headers.map((header) => escapeCell(header, spreadsheetSafe)).join(","),
    ...flatRows.map((row) =>
      headers.map((h) => escapeCell((row as Record<string, unknown>)[h], spreadsheetSafe)).join(",")
    ),
  ];

  return csvRows.join("\n");
}
