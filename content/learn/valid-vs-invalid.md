---
title: Valid vs Invalid JSON
level: comfortable
order: 8
keyTerms: []
---

Invalid JSON will cause parsing to fail. Common errors: forgetting quotes, using single quotes, trailing commas, or JavaScript-only values like `undefined` or `NaN` (which aren't valid JSON).

```text
// ✅ Valid
{"a": 1, "b": [2, 3]}

// ❌ Trailing comma
{"a": 1, "b": 2,}

// ❌ Single quotes (JavaScript OK, JSON invalid)
{'a': 1}

// ❌ Unquoted key
{a: 1}

// ❌ undefined is not valid JSON
{"a": undefined}
```
