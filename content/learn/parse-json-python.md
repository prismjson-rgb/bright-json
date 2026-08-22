---
title: "Parsing JSON in Python"
metaTitle: "Parse JSON in Python: loads, dumps, and Gotchas"
metaDescription: "Python's json module maps cleanly to dicts and lists. Learn loads vs load, dumps options, the type mapping, and the mistakes that bite beginners."
level: intermediate
order: 52
keyTerms: [python json, json.loads, json.dumps, dict, parse json]
relatedTools: [json-formatter, json-validator]
relatedLearn: [parse-stringify, parse-json-javascript]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Python's built-in `json` module converts between JSON text and Python objects. Use `json.loads()` to parse a JSON **string** into a dict/list, and `json.dumps()` to serialize a Python object back to a JSON string. The `load`/`dump` variants (no "s") work on **files**. To check that a string is valid before parsing, run it through the [JSON Validator](/tools/json-validator/).

## The four functions

The "s" means "string"; without it, the function works on a file object:

```python
import json

# string → Python object
data = json.loads('{"name": "Ada", "age": 36}')   # {'name': 'Ada', 'age': 36}

# Python object → string
text = json.dumps(data)                            # '{"name": "Ada", "age": 36}'

# file → Python object
with open("data.json") as f:
    data = json.load(f)

# Python object → file
with open("out.json", "w") as f:
    json.dump(data, f)
```

## How types map

JSON and Python types line up closely, with a few names changed:

| JSON | Python |
| --- | --- |
| object | `dict` |
| array | `list` |
| string | `str` |
| number (int) | `int` |
| number (real) | `float` |
| `true` / `false` | `True` / `False` |
| `null` | `None` |

Two things to watch: JSON object **keys are always strings**, so `json.loads('{"1": "a"}')` gives `{"1": "a"}`, not `{1: "a"}`. And `json.dumps` turns dict keys into strings, so an `int` key round-trips as a string.

## Useful `dumps` options

```python
json.dumps(data, indent=2)            # pretty-print
json.dumps(data, sort_keys=True)      # deterministic key order
json.dumps(data, ensure_ascii=False)  # keep é, 你好, emoji as-is (not \uXXXX)
json.dumps(data, separators=(",", ":"))  # minify — no spaces
```

`ensure_ascii=True` (the default) escapes non-ASCII characters as `\uXXXX`. Setting it `False` writes real UTF-8, which is usually what you want for readable output — see [Escaping Special Characters](/learn/escaping-special-chars/).

## Common gotchas

- **Printing a dict isn't JSON.** `print(d)` and `str(d)` use single quotes and `True`/`None` — invalid JSON. Always use `json.dumps()`. See [Single Quotes in JSON](/learn/fix-single-quotes-json/).
- **Non-serializable types raise `TypeError`.** `datetime`, `set`, `Decimal`, and `bytes` aren't JSON types. Convert first (e.g. `dt.isoformat()` — see [Dates in JSON](/learn/json-dates/)) or pass a `default=` function to `dumps`.
- **Big integers are fine in Python** (arbitrary precision) but may lose precision once a JavaScript client parses them — see [Big Numbers in JSON](/learn/json-big-numbers/).
- **`json.loads` raises `json.JSONDecodeError`** with a line, column, and position on invalid input — catch it and inspect with the [JSON Debugger](/tools/json-debugger/).

## Frequently asked questions

**What's the difference between `loads` and `load` in Python?**
`loads` parses a JSON **string**; `load` reads from a **file** object. The same pattern applies to `dumps` (to string) and `dump` (to file).

**How do I convert a Python dict to JSON?**
Use `json.dumps(my_dict)` for a string, or `json.dump(my_dict, file)` to write to a file. Never use `str(dict)` — it produces invalid JSON with single quotes.

**Why do my JSON number keys become strings?**
JSON object keys must be strings, so `json.dumps` converts dict keys to strings and `json.loads` always returns string keys. Convert them back to `int` in your code if needed.

**How do I serialize a datetime to JSON in Python?**
`datetime` isn't JSON-serializable. Convert it to an ISO 8601 string with `.isoformat()` first, or pass a `default=` function to `json.dumps` that handles it.
