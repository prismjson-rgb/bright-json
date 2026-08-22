---
title: JSON Trimmer
metaTitle: JSON Trimmer | Strip Comments, Trailing Commas, and Noise
metaDescription: Turn loose JSON-like input into strict JSON by removing comments, trailing commas, and formatting noise.
summary: Clean permissive input so it becomes strict JSON ready for tooling and production systems.
category: Cleanup
appHref: /app/?tool=json-trimmer
badge: Strict mode
order: 9
keywords: [json trimmer, json cleanup, remove trailing commas json]
relatedTools: [json-formatter, json-validator]
relatedLearn: [minify-json, fixing-trailing-commas, json5-vs-jsonc]
highlights:
  - Remove comments and trailing commas
  - Normalize loose input
  - Prepare data for strict parsers
useCases:
  - JSON5 cleanup
  - Legacy config cleanup
  - Vendor payload normalization
faqs:
  - question: "What does the JSON Trimmer remove?"
    answer: "The JSON Trimmer removes unnecessary whitespace (minifies the JSON), can remove specific keys you specify, strip null values, remove empty arrays and objects, and truncate long string values. It is useful for reducing payload size before sending JSON to an API or an LLM."
  - question: "How do I minify JSON?"
    answer: "Paste your JSON into the JSON Trimmer and click minify. All whitespace outside of string values is removed, reducing file size by 15–30% for typical documents. The output is valid JSON identical in data to the input."
  - question: "Can I remove specific keys from JSON?"
    answer: "Yes. Enter the key names you want to remove, and the trimmer will recursively delete those keys at every depth in the document. This is useful for stripping debug fields, internal metadata, or sensitive fields before sharing or sending JSON."
  - question: "How much does minifying JSON reduce file size?"
    answer: "For typical JSON with readable formatting (2-space indent), minification saves 15–30% of bytes. For JSON with deeply nested structures and many short keys, the saving can be higher. Combined with gzip compression, the total reduction is usually 70–90%."
---
The JSON Trimmer converts loose, permissive JSON-like input into strict, spec-compliant JSON by removing comments, trailing commas, and other syntax that standard parsers reject. Config files, scaffolding output, and hand-edited payloads frequently include these extras because editors like VS Code accept them. The moment that data hits a production parser, import tool, or API endpoint, the extras cause failures. The trimmer strips them out in one step.

## How to use the JSON Trimmer

1. Paste your loose JSON, JSON5, or JSONC input into the editor.
2. The trimmer scans for comments (`//` inline, `/* */` block), trailing commas, and other non-standard syntax.
3. Review the cleaned output in the right panel.
4. Confirm nothing meaningful was removed — comments that document intent are stripped; data values are untouched.
5. Copy the clean output and pass it to your validator, converter, or import pipeline.

## What it fixes

- `//` and `/* */` comments that are valid in JSON5 or JSONC but not in standard JSON
- Trailing commas after the last element in arrays and objects
- Leading commas and other formatting patterns that some editors tolerate but parsers reject
- Extra whitespace around structural characters that causes parse failures in strict environments
- Mixed quote styles left over from template generation

## JSON code example

The following is a typical VS Code `settings.json` fragment — valid JSONC but invalid strict JSON:

```json
{
  // Editor preferences
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "node_modules": true,  /* large folder, always excluded */
  }
}
```

After trimming, all comments and the trailing comma inside `files.exclude` are removed, leaving a payload that any JSON parser will accept.

## When to use it

- **JSON5 or JSONC cleanup.** You use a permissive format during development because it supports comments, but your build step or API endpoint requires strict JSON. Trim before the handoff.
- **Legacy config migration.** An old tool emitted annotated config files. You want to import them into a new system that reads only strict JSON without manually stripping every comment.
- **Vendor payload normalization.** A third-party service sends payloads that include trailing commas in arrays. Your parser rejects them. Trim on ingestion before processing.
- **Pre-validation cleanup.** You want to run the [JSON Formatter](/tools/json-formatter/) or a schema validator but the input has too much noise to parse at all.

## Related tools and articles

- [JSON Formatter](/tools/json-formatter/) — format the clean output for readability once the noise is gone
- [JSON Minimal Mode](/tools/json-minimal-mode/) — reduce a trimmed payload further by keeping only the fields you need
- [Pretty vs Minified JSON](/learn/pretty-vs-minified/) — understand the difference between readable and compact representations and when each is appropriate
