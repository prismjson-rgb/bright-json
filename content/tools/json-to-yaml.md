---
title: JSON to YAML Converter
metaTitle: JSON to YAML Converter | Convert JSON to YAML Online, Free
metaDescription: Convert JSON to clean, properly indented YAML in your browser. Works with nested objects and arrays of any depth — nothing uploads to a server.
summary: Turn JSON into readable YAML for configs, Kubernetes manifests, and CI pipelines.
category: Convert
appHref: /app/?tool=json-to-yaml
badge: Transform
order: 7.2
keywords: [json to yaml, convert json to yaml, json to yaml converter, json to yml]
relatedTools: [json-converter, json-formatter, json-to-csv]
relatedLearn: [json-vs-yaml]
highlights:
  - Preserves full nesting — no flattening needed
  - Consistent 2-space indentation, no line wrapping
  - Works on any JSON shape — object, array, or primitive
useCases:
  - Writing Kubernetes manifests or Docker Compose files from JSON
  - Converting an API response into config-file-ready YAML
  - Turning JSON into YAML for CI/CD pipeline definitions
faqs:
  - question: "How do I convert JSON to YAML?"
    answer: "Paste your JSON into the input panel, open the Convert panel, and select the YAML tab (or use this dedicated JSON to YAML tool, which opens directly into it). The converted YAML appears immediately and updates as you edit the JSON."
  - question: "Does JSON to YAML conversion work with nested objects and arrays?"
    answer: "Yes, at any depth. Unlike CSV, YAML natively supports nesting, so objects become indented mappings and arrays become dash-prefixed lists — nothing gets flattened or serialized into a string."
  - question: "Does it need to be an array of objects, like the CSV converter?"
    answer: "No. Any valid JSON value converts — a top-level object, a top-level array, an array of primitives, or a single string or number. YAML has no structural requirement like CSV's array-of-objects rule."
  - question: "Will the YAML round-trip back to the exact same JSON?"
    answer: "Yes. YAML is a superset of JSON's data model, so converting JSON to YAML and back with any standard YAML parser reproduces the same objects, arrays, strings, numbers, booleans, and nulls."
  - question: "Why does the output use 2-space indentation with no line wrapping?"
    answer: "That matches the convention used by most YAML tooling — Kubernetes manifests, GitHub Actions, and Docker Compose files — so the output can usually be pasted in as-is without reformatting."
---
The JSON to YAML Converter turns any JSON value — object, array, or primitive — into clean, properly indented YAML. Because YAML natively supports the same nested structures JSON does, nothing needs to be flattened or serialized: objects become indented mappings, arrays become dash-prefixed lists, and the result stays valid at any nesting depth.

## How to use the JSON to YAML Converter

1. Paste your JSON into the input panel.
2. Open the Convert panel; it opens directly on the YAML tab.
3. Copy the generated YAML, or download it as a `.yaml` file.
4. Edit the source JSON and the YAML output updates immediately.

## What it handles

- Deep nesting of objects and arrays, preserved exactly as indentation levels, with no depth limit
- Any top-level shape — a JSON object, a JSON array, or even a single string, number, or boolean
- Strings that need YAML-specific quoting (colons, leading dashes, reserved words like `true` or `null`) are quoted automatically so the output parses back correctly
- Long values are never line-wrapped, so multi-line strings and long URLs stay on one line

## JSON code example

This JSON:

```json
{
  "service": "api",
  "replicas": 3,
  "ports": [8080, 8443],
  "env": { "NODE_ENV": "production" }
}
```

converts to:

```yaml
service: api
replicas: 3
ports:
  - 8080
  - 8443
env:
  NODE_ENV: production
```

## When to use it

- **Kubernetes manifests and Helm values.** Draft a resource as JSON, then convert to the YAML Kubernetes expects.
- **CI/CD pipeline files.** GitHub Actions, GitLab CI, and CircleCI configs are YAML — build the logic as JSON first if that's easier to script, then convert.
- **Docker Compose files.** Convert a JSON service definition into `docker-compose.yml` format.
- **Config migration.** Move a config that started as JSON (from an API or a generator) into a YAML-based tool without hand-editing the structure.

## Related tools and articles

- [JSON Converter](/tools/json-converter/) — convert the same JSON into CSV, XML, TOON, or an escaped string instead
- [JSON Formatter](/tools/json-formatter/) — validate and pretty-print your JSON before converting it
- [JSON to CSV Converter](/tools/json-to-csv/) — for when the destination is a spreadsheet instead of a config file
- [JSON vs YAML](/learn/json-vs-yaml/) — how the two formats differ and when to reach for each
