---
title: String to JSON Converter
metaTitle: String to JSON Converter | Unescape a JSON String Literal
metaDescription: Paste an escaped JSON string and convert it back into readable, pretty-printed JSON in your browser. Handles \" and \n escaping automatically.
summary: Paste an escaped string and get clean, readable JSON back.
category: Convert
appHref: /app/?tool=string-to-json
badge: Transform
order: 7.6
keywords: [string to json, unescape json, json unescape, parse escaped json, json string to object]
relatedTools: [json-to-string, json-converter, ai-json-cleaner]
relatedLearn: [escaping-special-chars, parse-stringify]
highlights:
  - Unescapes quotes and newlines automatically
  - Works with or without surrounding outer quotes
  - Load the result straight into the editor
useCases:
  - Recovering JSON copied from a log line
  - Reading a JSON string nested inside another JSON field
  - Debugging double-escaped payloads from APIs or code
faqs:
  - question: "What does a String to JSON converter do?"
    answer: "It takes a string that contains escaped JSON - with backslash-escaped quotes like \\\" and newlines as \\n - and reverses the escaping, then parses the result into a readable, pretty-printed JSON document. It is the equivalent of calling JSON.parse() twice: once to unescape the string, once to parse the JSON inside it."
  - question: "Where do escaped JSON strings like this come from?"
    answer: "Common sources are log lines where a JSON payload was logged as a string, API responses that nest a JSON document inside a string field, JSON.stringify() being called twice by mistake in application code, or copying a JSON value out of another JSON document's string field."
  - question: "Do I need to include the outer quotes?"
    answer: "No. The converter accepts the string with or without its surrounding double quotes. If you paste it without outer quotes, it is treated as if it had them; if parsing fails, it falls back to treating the input as plain, already-valid JSON."
  - question: "How do I go the other direction?"
    answer: "Use the companion JSON to String tool. Paste JSON there and it produces the escaped, quoted string form of it - useful for embedding JSON in code, config values, or single-line logs."
---
The String to JSON Converter reverses JSON escaping: paste a string containing backslash-escaped quotes and newlines, and it unescapes and parses the content back into clean, pretty-printed JSON. This is the tool you reach for after copying an escaped JSON payload out of a log line, an API response, or a string field nested inside another JSON document.

## How to use the String to JSON Converter

1. Open the **String to JSON** panel from the left rail (under Transform).
2. Paste the escaped string - with or without its surrounding quotes.
3. The recovered, pretty-printed JSON appears on the right automatically.
4. Click **Use in Editor** to load it into a tab for further editing, validation, or conversion.

## What it fixes

- Manually removing backslashes one at a time to read an escaped payload
- Confusion over whether a string needs one or two rounds of unescaping
- Copy-pasting an escaped JSON string into a JSON parser and getting a syntax error because it is still escaped
- Losing time writing a throwaway script just to call `JSON.parse()` twice

## JSON code example

Given this escaped string:

```
"{\"name\":\"Alice\",\"role\":\"admin\"}"
```

the converter recovers:

```json
{
  "name": "Alice",
  "role": "admin"
}
```

## When to use it

- **Reading logs.** A JSON payload was logged as a string value - paste it here instead of manually unescaping it.
- **Nested JSON fields.** An API response contains a JSON document as a string inside another JSON object; extract and read it without leaving your browser.
- **Debugging double-stringified data.** Application code called `JSON.stringify()` an extra time by mistake - recover the original structure to see what actually went wrong.
- **Working backward from JSON to String output.** Verify that a string produced by the [JSON to String](/tools/json-to-string/) tool round-trips correctly.

## Related tools and articles

- [JSON to String](/tools/json-to-string/) - the reverse direction: escape JSON into a string literal
- [JSON Converter](/tools/json-converter/) - convert JSON into YAML, XML, TOON, or CSV
- [AI JSON Cleaner](/tools/ai-json-cleaner/) - extract JSON from messy, mixed text rather than a clean escaped string
- [Escaping and Special Characters](/learn/escaping-special-chars/) - how JSON escaping works for quotes, backslashes, and control characters
- [Parsing and Stringifying](/learn/parse-stringify/) - the JSON.parse() and JSON.stringify() fundamentals this tool automates
