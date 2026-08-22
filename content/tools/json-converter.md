---
title: JSON Converter
metaTitle: JSON Converter | Convert JSON to YAML, XML, and CSV
metaDescription: Convert JSON into YAML, XML, or CSV from one workspace without moving data into a separate service.
summary: Reformat JSON into the output your workflow needs next.
category: Convert
appHref: /app/?tool=json-converter
badge: Transform
order: 7
keywords: [json to yaml, json to xml, json to csv]
relatedTools: [json-formatter, json-trimmer]
relatedLearn: [convert-json-to-csv, json-vs-xml-csv, json-vs-yaml]
highlights:
  - Multiple output formats
  - Browser-based conversion
  - Good for docs and exports
useCases:
  - Data exchange
  - Spreadsheet prep
  - Format comparison
faqs:
  - question: "How do I convert JSON to CSV?"
    answer: "Paste your JSON array of objects into the JSON Converter, select CSV as the output format, and click convert. Each object becomes a row; the keys of the first object become the column headers. Nested objects are flattened using dot notation by default."
  - question: "Can I convert CSV to JSON?"
    answer: "Yes. Paste your CSV into the converter, select JSON as the output, and each row becomes a JSON object. The first row is treated as headers and becomes the keys. Values that look like numbers or booleans can optionally be typed automatically."
  - question: "How do I convert JSON to XML?"
    answer: "The JSON Converter supports JSON-to-XML conversion. JSON objects become XML elements, arrays become repeated elements with the same tag name, and string values become text content. You can customize the root element name."
  - question: "Why does my JSON-to-CSV conversion lose nested data?"
    answer: "CSV is a flat format — it cannot represent nested objects or arrays natively. When converting, nested objects are either flattened (e.g., address.city becomes a column) or serialized as a JSON string in the cell. Choose the strategy that fits how you plan to use the CSV."
---
The JSON Converter transforms JSON into YAML, XML, or CSV without leaving your browser. When you are moving data between systems — an API response into an infrastructure file, a config export into a spreadsheet, or a document payload into an XML feed — switching formats manually by hand introduces errors and wastes time. Converting inside one workspace keeps the original alongside the output so you can verify the result immediately.

## How to use the JSON Converter

1. Paste or type your source JSON into the input panel.
2. Select the target format: YAML, XML, or CSV.
3. Review the converted output in the right panel.
4. Copy the result or download it for use in your target system.
5. If the structure looks off, switch back to the source and reformat it with the [JSON Formatter](/tools/json-formatter/) before converting again.

## What it fixes

- Copy-paste loops between separate conversion services that do not show both sides at once
- Silent data loss when converting nested objects to CSV without flattening first
- Encoding mismatches between JSON string values and XML character rules
- Time spent reformatting YAML indentation that a converter should handle automatically
- Inconsistent field order after manual format translation

## JSON code example

The following order payload in JSON converts cleanly to YAML for use in a workflow config:

```json
{
  "order": {
    "id": "ORD-8821",
    "customer": "Lena Fischer",
    "items": [
      { "sku": "A100", "qty": 2, "price": 19.99 },
      { "sku": "B204", "qty": 1, "price": 49.00 }
    ],
    "shipped": false
  }
}
```

The nested `items` array is the kind of structure that requires attention when targeting CSV, since each item becomes its own row.

## When to use it

- **Infrastructure handoffs.** Your deployment scripts expect YAML, but the service emits JSON. Convert once rather than maintaining two source files.
- **Spreadsheet prep.** Export a flat JSON array to CSV so a non-technical stakeholder can open it directly in Excel or Google Sheets.
- **API documentation.** XML is still required by some enterprise integration partners; convert a sample payload before sending it to their team.
- **Format comparison.** You want to see whether YAML or JSON is more readable for a config file before committing to one in a shared repository.

## Related tools and articles

- [JSON Formatter](/tools/json-formatter/) — pretty-print and validate before converting to avoid producing malformed output in the target format
- [JSON Trimmer](/tools/json-trimmer/) — strip trailing commas and comments from loose JSON so it converts cleanly
- [JSON vs XML and CSV](/learn/json-vs-xml-csv/) — understand the structural trade-offs before choosing a target format
- [JSON Alternatives](/learn/json-alternatives/) — broader overview of when YAML, TOML, or other formats are a better fit than JSON
