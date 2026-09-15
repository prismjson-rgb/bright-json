---
title: JSON to XML Converter
metaTitle: JSON to XML Converter | Convert JSON to XML Online, Free
metaDescription: Convert JSON to well-formed XML in your browser, with a customizable root element. Arrays become repeated elements - nothing uploads to a server.
summary: Turn JSON into well-formed XML for legacy APIs, SOAP services, and XML-based pipelines.
category: Convert
appHref: /app/?tool=json-to-xml
badge: Transform
order: 7.3
keywords: [json to xml, convert json to xml, json to xml converter]
relatedTools: [json-converter, json-formatter, json-to-csv]
relatedLearn: [json-vs-xml-csv]
highlights:
  - Arrays become repeated elements with the same tag name
  - Invalid characters in keys are sanitized into valid XML tag names
  - Customizable root element name
useCases:
  - Integrating with legacy or SOAP-based APIs that expect XML
  - Converting a JSON payload for an XML-only pipeline step
  - Generating sample XML from a JSON schema or mock payload
faqs:
  - question: "How do I convert JSON to XML?"
    answer: "Paste your JSON into the input panel, open the Convert panel, and select the XML tab (or use this dedicated JSON to XML tool, which opens directly into it). Each object key becomes an XML element wrapping its value."
  - question: "What happens to arrays when converting JSON to XML?"
    answer: "Each item in an array becomes a repeated <item> element inside the parent tag, since XML has no native array type. A tags array like [\"a\",\"b\"] becomes two <item> elements inside a <tags> wrapper."
  - question: "Can I change the root element name?"
    answer: "Yes - the top-level wrapper defaults to <root>, and it's configurable so the output matches the element name your target API or schema expects."
  - question: "What if a JSON key isn't a valid XML tag name?"
    answer: "Keys with spaces or characters XML doesn't allow in tag names (like @ or %) are sanitized - invalid characters become underscores, and a tag that would start with a digit gets an underscore prefix - so the output is always well-formed XML."
  - question: "How are null values represented in the XML output?"
    answer: "A null value becomes a self-closing element with an explicit nil marker, e.g. <field xsi:nil=\"true\" />, rather than an empty tag, so it's unambiguous that the value is null and not an empty string."
---
The JSON to XML Converter turns a JSON object or array into well-formed XML. Object keys become element names, values become element content or nested elements, and arrays become a sequence of repeated elements - the structural conversion XML requires since it has no native array type.

## How to use the JSON to XML Converter

1. Paste your JSON into the input panel.
2. Open the Convert panel; it opens directly on the XML tab.
3. Copy the generated XML, or download it as an `.xml` file.
4. Set a custom root element name if your target system expects something other than `<root>`.

## What it handles

- Arrays converted into repeated `<item>` elements, since XML has no native list type
- Object keys sanitized into valid XML tag names - invalid characters become underscores, and a tag starting with a digit gets an underscore prefix
- Special characters in string values (`&`, `<`, `>`, `"`, `'`) escaped automatically so the output is well-formed
- `null` values represented as a self-closing element with an explicit nil marker, distinguishing them from empty strings
- A customizable root element, defaulting to `<root>`

## JSON code example

This JSON:

```json
{
  "user": {
    "name": "Alice",
    "roles": ["admin", "editor"]
  }
}
```

converts to:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user>
    <name>Alice</name>
    <roles>
      <item>admin</item>
      <item>editor</item>
    </roles>
  </user>
</root>
```

## When to use it

- **Legacy and SOAP APIs.** Many enterprise and SOAP-based services still expect XML request or response bodies.
- **XML-only pipeline steps.** When a downstream tool in a data pipeline only accepts XML, convert the JSON payload before handing it off.
- **Generating sample XML.** Quickly produce example XML from a JSON mock or schema, for documentation or test fixtures.
- **Migrating from XML-based systems.** Cross-check that a newer JSON-based payload maps back to the XML shape an older system still expects.

## Related tools and articles

- [JSON Converter](/tools/json-converter/) - convert the same JSON into YAML, CSV, TOON, or an escaped string instead
- [JSON Formatter](/tools/json-formatter/) - validate and pretty-print your JSON before converting it
- [JSON to CSV Converter](/tools/json-to-csv/) - for when the destination is a spreadsheet instead of an XML document
- [JSON vs XML vs CSV](/learn/json-vs-xml-csv/) - how the three formats differ and when to reach for each

## XML names and characters

Keys and the root name are normalized to valid ASCII XML names: unsupported characters become underscores and invalid starting characters receive an underscore prefix. Colliding normalized keys and characters XML 1.0 cannot represent produce an error. Null values use `xsi:nil` with the namespace declared on the root.
