function escapeCell(val: unknown): string {
  const str = val === null || val === undefined ? "" : String(val);
  // Quote if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, fullKey));
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val);
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

export function jsonToCsv(parsed: unknown): string {
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
  const csvRows = [
    headers.map(escapeCell).join(","),
    ...flatRows.map((row) =>
      headers.map((h) => escapeCell((row as Record<string, unknown>)[h])).join(",")
    ),
  ];

  return csvRows.join("\n");
}
