/**
 * Comprehensive JSON Tutorial Content — Beginner to Advanced
 * SEO-friendly, structured for semantic HTML and discoverability
 */

export type Level = "beginner" | "comfortable" | "practical" | "intermediate" | "advanced" | "expert";

export interface TutorialSection {
  id: string;
  level: Level;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  code?: string;
  codeLabel?: string;
  bullets?: string[];
  subSections?: { title: string; content: string; code?: string }[];
  tryExample?: string;
  keyTerms?: string[];
}

export const LEARN_LEVELS: { id: Level; label: string; description: string }[] = [
  { id: "beginner", label: "Basics for Beginners", description: "Never used JSON? Start here." },
  { id: "comfortable", label: "Getting Comfortable", description: "Understand structure and patterns." },
  { id: "practical", label: "Practical JSON", description: "Real-world usage and APIs." },
  { id: "intermediate", label: "Intermediate", description: "Validation, schema, and best practices." },
  { id: "advanced", label: "Advanced", description: "JSON Schema, JSONPath, performance." },
  { id: "expert", label: "Expert Level", description: "Security, streaming, alternatives." },
];

export const TUTORIAL_SECTIONS: TutorialSection[] = [
  // ═══════════════════════════════════════════════════════════
  // LEVEL 1: BASICS FOR BEGINNERS
  // ═══════════════════════════════════════════════════════════
  {
    id: "what-is-json",
    level: "beginner",
    title: "What is JSON?",
    metaTitle: "What is JSON? A Complete Introduction for Beginners",
    metaDescription: "JSON (JavaScript Object Notation) is a lightweight data format used by 70%+ of APIs. Learn what JSON is, why it exists, and when to use it.",
    content: "JSON stands for JavaScript Object Notation. It's a lightweight, text-based format for storing and exchanging data between systems. Created by Douglas Crockford in 2001 and standardized as ECMA-404 and RFC 8259, JSON has become the de facto standard for web APIs—over 70% of public APIs use JSON. Unlike XML, it's human-readable and easy for both humans and machines to parse.",
    keyTerms: ["JSON", "data interchange", "API", "lightweight", "text-based"],
  },
  {
    id: "json-vs-xml-csv",
    level: "beginner",
    title: "JSON vs XML vs CSV",
    content: "JSON is often compared to XML and CSV. XML uses tags and is verbose; JSON is more compact. CSV is flat and great for spreadsheets but poor for nested data. JSON sits in the middle: readable, hierarchical, and widely supported in every programming language.",
    code: `// XML (verbose)
<user>
  <name>Alice</name>
  <age>30</age>
</user>

// JSON (compact)
{"name": "Alice", "age": 30}

// CSV (flat only)
name,age
Alice,30`,
    codeLabel: "Same data, different formats",
    bullets: ["JSON: compact, hierarchical, universal support", "XML: verbose, schema-rich, legacy systems", "CSV: flat, spreadsheet-friendly, no nesting"],
  },
  {
    id: "six-data-types",
    level: "beginner",
    title: "The Six JSON Data Types",
    metaTitle: "JSON Data Types: String, Number, Boolean, Null, Object, Array",
    metaDescription: "JSON supports exactly six data types. Learn strings, numbers, booleans, null, objects, and arrays with examples.",
    content: "JSON has exactly six data types. Understanding these is the foundation of working with JSON.",
    subSections: [
      {
        title: "String",
        content: "A sequence of characters wrapped in double quotes. Use backslash for escaping: \\\" for quotes, \\\\ for backslash, \\n for newline.",
        code: `"Hello, World!"
"Escaped: \\"quote\\" and \\\\backslash\\\\"
"Line 1\\nLine 2"`,
      },
      {
        title: "Number",
        content: "Integers or decimals. No quotes. Scientific notation allowed.",
        code: `42
3.14
-100
1.5e10`,
      },
      {
        title: "Boolean",
        content: "Logical values. Must be lowercase: true or false.",
        code: `true
false`,
      },
      {
        title: "Null",
        content: "Represents absence of value. Always lowercase null.",
        code: `null`,
      },
      {
        title: "Object",
        content: "Unordered collection of key-value pairs in curly braces. Keys must be strings.",
        code: `{"name": "Alice", "age": 30, "active": true}`,
      },
      {
        title: "Array",
        content: "Ordered list of values in square brackets. Values can be any type.",
        code: `["red", "green", "blue"]
[1, 2, 3, 4, 5]
[true, false, null]`,
      },
    ],
    keyTerms: ["string", "number", "boolean", "null", "object", "array"],
  },
  {
    id: "syntax-rules",
    level: "beginner",
    title: "JSON Syntax Rules — The Golden Rules",
    metaTitle: "JSON Syntax Rules: Keys, Quotes, Commas, and More",
    metaDescription: "Master JSON syntax: double quotes for keys and strings, no trailing commas, no comments. Avoid common JSON mistakes.",
    content: "Follow these rules or your JSON will be invalid.",
    bullets: [
      "Keys must be strings in double quotes — not single quotes",
      "Strings must use double quotes — single quotes are invalid",
      "No trailing commas after the last item in objects or arrays",
      "No comments allowed — JSON has no // or /* */ support",
      "true, false, and null must be lowercase",
      "Numbers have no quotes: use 42, not \"42\"",
      "Commas separate items; no comma after the last item",
    ],
    code: `// ✅ Valid JSON
{"name": "Alice", "age": 30}

// ❌ Invalid: single quotes
{'name': 'Alice'}

// ❌ Invalid: trailing comma
{"name": "Alice",}

// ❌ Invalid: unquoted key
{name: "Alice"}`,
    codeLabel: "Valid vs invalid JSON",
  },
  {
    id: "first-json-object",
    level: "beginner",
    title: "Your First JSON Object",
    content: "A simple object has keys and values. Think of it like a dictionary or a form: each field has a name (key) and a value.",
    tryExample: `{"name": "Your Name", "favoriteColor": "blue", "luckyNumber": 7}`,
    code: `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "active": true
}`,
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2: GETTING COMFORTABLE
  // ═══════════════════════════════════════════════════════════
  {
    id: "objects-arrays-depth",
    level: "comfortable",
    title: "Objects and Arrays in Depth",
    content: "Objects group related data; arrays hold lists. You can nest them: objects inside arrays, arrays inside objects. There's no limit to how deep you can go (though readability suffers after 3–4 levels).",
    code: `{
  "users": [
    {"id": 1, "name": "Alice", "roles": ["admin", "editor"]},
    {"id": 2, "name": "Bob", "roles": ["viewer"]}
  ],
  "metadata": {
    "total": 2,
    "page": 1
  }
}`,
    codeLabel: "Nested structure: array of objects inside an object",
  },
  {
    id: "common-patterns",
    level: "comfortable",
    title: "Common JSON Patterns",
    metaTitle: "Common JSON Patterns: API Responses, Configs, and More",
    metaDescription: "Learn the most common JSON patterns: list of objects, nested config, key-value lookup. Copy-paste ready examples.",
    content: "These patterns appear everywhere in real applications.",
    subSections: [
      {
        title: "List of Objects (API responses)",
        content: "The most common pattern — an array of uniform objects. Used by almost every REST API.",
        code: `[
  {"id": 1, "name": "Alice", "email": "alice@example.com"},
  {"id": 2, "name": "Bob", "email": "bob@example.com"}
]`,
      },
      {
        title: "Nested Configuration",
        content: "Objects inside objects for grouping. Perfect for app config, feature flags, and settings.",
        code: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb"
  },
  "features": {
    "darkMode": true,
    "notifications": false
  }
}`,
      },
      {
        title: "Key-Value Lookup (Dictionary)",
        content: "Flat object as a map. Great for currency rates, translations, or status codes.",
        code: `{
  "USD": 1.0,
  "EUR": 0.92,
  "GBP": 0.79,
  "JPY": 149.50
}`,
      },
    ],
  },
  {
    id: "valid-vs-invalid",
    level: "comfortable",
    title: "Valid vs Invalid JSON",
    content: "Invalid JSON will cause parsing to fail. Common errors: forgetting quotes, using single quotes, trailing commas, or JavaScript-only values like undefined or NaN (which aren't valid JSON).",
    code: `// ✅ Valid
{"a": 1, "b": [2, 3]}

// ❌ Trailing comma
{"a": 1, "b": 2,}

// ❌ Single quotes (JavaScript OK, JSON invalid)
{'a': 1}

// ❌ Unquoted key
{a: 1}

// ❌ undefined is not valid JSON
{"a": undefined}`,
    codeLabel: "Common invalid JSON examples",
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 3: PRACTICAL
  // ═══════════════════════════════════════════════════════════
  {
    id: "json-in-apis",
    level: "practical",
    title: "JSON in REST APIs",
    metaTitle: "How JSON is Used in REST APIs — Complete Guide",
    metaDescription: "Learn how JSON powers REST APIs. Request and response examples, Content-Type headers, and parsing in JavaScript, Python, and more.",
    content: "REST APIs send and receive JSON. The client sends JSON in the request body (e.g., POST), and the server responds with JSON. Always set Content-Type: application/json.",
    code: `// Typical API response
{
  "data": [
    {"id": 1, "title": "First Post"},
    {"id": 2, "title": "Second Post"}
  ],
  "meta": {
    "page": 1,
    "total": 42
  }
}`,
    codeLabel: "Common REST API response structure",
    bullets: ["GET returns JSON in the body", "POST/PUT/PATCH send JSON in the body", "Content-Type: application/json header", "Status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found"],
  },
  {
    id: "parse-stringify",
    level: "practical",
    title: "Parsing and Stringifying",
    metaTitle: "JSON.parse() and JSON.stringify() — Complete Guide",
    metaDescription: "Convert JSON text to objects with JSON.parse. Convert objects to JSON with JSON.stringify. Learn revivers, replacers, and pretty-printing.",
    content: "In JavaScript: JSON.parse() converts a JSON string into an object. JSON.stringify() does the opposite. Other languages have equivalents (json.loads/json.dumps in Python, json_decode/json_encode in PHP).",
    code: `// Parse: string → object
const str = '{"name":"Alice","age":30}';
const obj = JSON.parse(str);
console.log(obj.name); // "Alice"

// Stringify: object → string
const json = JSON.stringify(obj);
// Pretty-print with 2-space indent
const pretty = JSON.stringify(obj, null, 2);`,
    codeLabel: "JavaScript: parse and stringify",
  },
  {
    id: "pretty-vs-minified",
    level: "practical",
    title: "Pretty Print vs Minified",
    content: "Pretty-printed JSON uses indentation and newlines for readability—ideal for config files and debugging. Minified JSON removes whitespace to reduce size—ideal for APIs and network transfer. Same data, different formatting.",
    code: `// Pretty (readable)
{
  "name": "Alice",
  "age": 30
}

// Minified (compact)
{"name":"Alice","age":30}`,
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 4: INTERMEDIATE
  // ═══════════════════════════════════════════════════════════
  {
    id: "json-schema-basics",
    level: "intermediate",
    title: "JSON Schema — Structure Your Data",
    metaTitle: "JSON Schema Tutorial: Validate and Define JSON Structure",
    metaDescription: "JSON Schema defines and validates JSON structure. Learn type checking, required fields, patterns, and validation tools.",
    content: "JSON Schema is a vocabulary for annotating and validating JSON documents. It defines allowed types, required properties, formats (email, date), and custom rules. Tools like Ajv (JavaScript) and jsonschema (Python) validate data against schemas.",
    code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "number", "minimum": 0},
    "email": {"type": "string", "format": "email"}
  },
  "required": ["name", "email"]
}`,
    codeLabel: "Simple JSON Schema example",
  },
  {
    id: "escaping-special-chars",
    level: "intermediate",
    title: "Escaping and Special Characters",
    content: "Inside JSON strings, certain characters must be escaped with a backslash: \\\" (quote), \\\\ (backslash), \\b (backspace), \\f (form feed), \\n (newline), \\r (carriage return), \\t (tab). Unicode can be written as \\uXXXX.",
    code: `"Quote: \\"Hello\\""
"Tab: col1\\tcol2"
"Newline: line1\\nline2"
"Unicode: \\u00A9 (copyright)"`,
  },
  {
    id: "common-mistakes",
    level: "intermediate",
    title: "Common JSON Mistakes and Fixes",
    metaTitle: "Top JSON Mistakes: Trailing Commas, Quotes, and How to Fix",
    metaDescription: "Avoid the most common JSON errors: trailing commas, single quotes, unquoted keys, and JavaScript-only values. Quick fixes and validation tips.",
    content: "Most JSON errors fall into a few categories. Know them and fix them fast.",
    bullets: [
      "Trailing comma: Remove the last comma before } or ]",
      "Single quotes: Replace with double quotes",
      "Unquoted keys: Wrap all keys in double quotes",
      "undefined/NaN: Use null or omit the property",
      "Comments: JSON doesn't support them—remove or use a separate config",
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 5: ADVANCED
  // ═══════════════════════════════════════════════════════════
  {
    id: "jsonpath",
    level: "advanced",
    title: "JSONPath — Query JSON Like SQL",
    metaTitle: "JSONPath Tutorial: Query and Extract JSON Data",
    metaDescription: "JSONPath lets you query JSON like XPath for XML. Select nested values with $, ., .., and []. RFC 9535 standard.",
    content: "JSONPath is a query language for JSON. Use it to extract specific values from nested structures. $ is the root, . accesses children, .. does recursive descent, [] selects by index or condition.",
    code: `// Data
{"users": [{"name": "Alice", "score": 95}, {"name": "Bob", "score": 87}]}

// JSONPath examples
$.users[0].name     → "Alice"
$.users[*].name     → ["Alice", "Bob"]
$.users[?(@.score > 90)].name → ["Alice"]`,
    codeLabel: "JSONPath selection examples",
  },
  {
    id: "performance-large-files",
    level: "advanced",
    title: "Performance: Large JSON Files",
    content: "Parsing huge JSON files can freeze the browser or exhaust memory. Use streaming parsers (e.g., JSONStream in Node, ijson in Python) to process incrementally. For files over 10–50MB, consider splitting or using a binary format.",
    bullets: ["Streaming parsers process chunk-by-chunk", "Avoid loading entire file into memory", "Consider pagination or chunked API responses", "Binary alternatives: MessagePack, BSON for very large data"],
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 6: EXPERT
  // ═══════════════════════════════════════════════════════════
  {
    id: "security",
    level: "expert",
    title: "JSON Security Best Practices",
    metaTitle: "JSON Security: Injection, Deserialization, and Validation",
    metaDescription: "Secure your JSON handling: prevent injection, validate with schema, limit depth, sanitize output. Enterprise security guide.",
    content: "Untrusted JSON can be dangerous. Validate with a schema, limit parsing depth, and never eval() JSON (use JSON.parse). Be wary of ReDoS in schema patterns. Whitelist allowed fields in APIs.",
    bullets: [
      "Always use JSON.parse(), never eval()",
      "Validate with JSON Schema before trusting data",
      "Limit object depth to prevent stack overflow",
      "Sanitize output to prevent XSS when rendering",
      "Use parameterized queries—never concatenate JSON into SQL",
    ],
  },
  {
    id: "json-alternatives",
    level: "expert",
    title: "JSON Alternatives: When to Use What",
    content: "JSON5 adds comments and trailing commas. JSONC is JSON with comments (used by VS Code config). YAML is more readable for config. MessagePack is binary and faster. Choose based on use case.",
    bullets: [
      "JSON5: JSON + comments, trailing commas, unquoted keys",
      "YAML: Human-friendly config, supports comments",
      "MessagePack: Binary, smaller, faster parsing",
      "Protocol Buffers: Strong typing, schema-first, binary",
    ],
  },
];

export function getSectionsByLevel(level: Level): TutorialSection[] {
  return TUTORIAL_SECTIONS.filter((s) => s.level === level);
}

export function getSectionById(id: string): TutorialSection | undefined {
  return TUTORIAL_SECTIONS.find((s) => s.id === id);
}
