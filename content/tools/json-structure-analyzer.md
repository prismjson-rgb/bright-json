---
title: JSON Structure Analyzer
metaTitle: JSON Structure Analyzer | Measure JSON Complexity and Shape
metaDescription: Inspect depth, type mix, and object complexity to understand how large and complicated a JSON payload really is.
summary: Get high-level metrics that explain the structure and size of a JSON document.
category: Analyze
appHref: /app/?tool=json-structure-analyzer
badge: Metrics
order: 12
keywords: [json analyzer, json structure analyzer, inspect json]
highlights:
  - Count keys and types
  - Spot deep nesting
  - Understand payload complexity
useCases:
  - Payload audits
  - Model input prep
  - API design review
faqs:
  - question: "What does the JSON Structure Analyzer tell me?"
    answer: "The Structure Analyzer inspects your JSON and reports: the total number of keys, nesting depth, value type distribution (how many strings vs numbers vs nulls), array lengths, key frequency across objects, and whether objects in an array are uniform or have varying shapes."
  - question: "How do I know if my JSON array has a consistent shape?"
    answer: "Paste your JSON into the Structure Analyzer. It will compare each object in the array and report which keys are present in all objects (consistent), which appear in some but not all (optional), and which are only in one object (unique). This is essential before mapping JSON to a database schema or TypeScript type."
  - question: "Can the Structure Analyzer help me write a JSON Schema?"
    answer: "Yes. The analyzer infers types and shapes from your actual data, which gives you the information needed to write a JSON Schema manually — or it can generate a draft schema from the inferred structure that you can then refine."
  - question: "What is the maximum depth of a JSON document?"
    answer: "The JSON specification does not define a maximum depth, but parsers and runtime stacks impose practical limits. Most parsers handle up to a few hundred levels before hitting a stack overflow. The Structure Analyzer reports the actual maximum depth of your document so you can identify problematic nesting early."
---
The JSON Structure Analyzer measures the shape and complexity of a JSON document: depth, key count, type distribution, array lengths, and nesting patterns. When you inherit an undocumented payload, prepare data for an LLM prompt, or review an API contract during a design discussion, these metrics tell you what you are actually dealing with before you start working with the content. Knowing a payload has a maximum nesting depth of 8 and 340 keys is different from eyeballing it and guessing.

## How to use the JSON Structure Analyzer

1. Paste your JSON document into the input panel.
2. The analyzer parses the document and computes structural metrics immediately.
3. Read the summary: total key count, maximum depth, type breakdown (string, number, boolean, null, object, array), and array size distribution.
4. Use the depth map to identify where the deepest nesting occurs so you know which branches to investigate.
5. Cross-reference findings with the [JSON Tree View](/tools/json-tree-view/) if you want to navigate the structure interactively alongside the metrics.

## What it fixes

- Blind spots when inheriting a payload with no schema or documentation
- Underestimating complexity before refactoring — depth of 12 is a different problem than depth of 3
- Missing type inconsistencies where a field is a string in some records and a number in others
- Lack of data for LLM token cost estimates — the analyzer gives you size and structure signals before you run the [JSON Token Estimator](/tools/json-token-estimator/)
- Vague conversations in API design reviews where "this payload seems large" needs actual numbers

## JSON code example

A product catalog response might look manageable in the editor but reveal complexity only through metrics:

```json
{
  "catalog": {
    "version": 3,
    "products": [
      {
        "id": "P-001",
        "name": "Wireless Headphones",
        "category": { "id": 12, "label": "Audio" },
        "variants": [
          { "color": "black", "stock": 120, "price": 79.99 },
          { "color": "white", "stock": 45, "price": 79.99 }
        ],
        "attributes": {
          "wireless": true,
          "batteryHours": 30,
          "codec": ["AAC", "SBC"]
        }
      }
    ]
  }
}
```

The analyzer would report a maximum depth of 5, a mix of string, number, boolean, and array types, and flag the nested `category` object and `variants` array as structural hotspots.

## When to use it

- **Payload audits.** You receive a large JSON export from a vendor and need to understand its shape before writing a parser or schema. Run the analyzer first to get a structural map.
- **LLM context preparation.** Before deciding whether to trim or filter a payload for a prompt, use the analyzer to understand how many keys and how much nesting you are dealing with.
- **API design reviews.** During a design discussion, you want objective complexity metrics to support the argument that a response is over-nested and should be flattened.
- **Performance investigation.** A large payload is causing slow renders. The analyzer identifies whether the problem is width (many top-level keys) or depth (deeply recursive nesting) so you target the right fix.

## Related tools and articles

- [JSON Tree View](/tools/json-tree-view/) — navigate the structure visually after reviewing the metrics to explore specific branches
- [JSON Best Practices Checker](/tools/json-best-practices-checker/) — follow up the structural analysis with a quality pass for naming conventions and maintainability patterns
- [JSON Schema Basics](/learn/json-schema-basics/) — learn how to formalize the structure you have analyzed into a schema for validation
- [Objects and Arrays in Depth](/learn/objects-arrays-depth/) — deeper reference on how JSON objects and arrays behave at scale
