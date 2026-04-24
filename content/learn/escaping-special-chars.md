---
title: Escaping and Special Characters
level: intermediate
order: 13
keyTerms: []
publishedAt: "2025-12-04"
---

Inside a JSON string, most characters can appear as-is. But a small set of characters must be escaped with a backslash, and control characters (characters with code points below U+0020) must always be escaped. Get this wrong and your JSON will fail to parse.

## Required escape sequences

| Sequence | Meaning |
|----------|---------|
| `\"` | Double quote |
| `\\` | Backslash |
| `\/` | Forward slash (optional but allowed) |
| `\b` | Backspace |
| `\f` | Form feed |
| `\n` | Newline (line feed) |
| `\r` | Carriage return |
| `\t` | Horizontal tab |
| `\uXXXX` | Any Unicode character by code point |

## Common escaping examples

Embedding a double quote inside a string:

```json
"She said \"hello\" and walked away."
```

A Windows file path (backslashes must be doubled):

```json
"C:\\Users\\Alice\\Documents\\report.json"
```

A tab-separated value:

```json
"Name\tAge\tCity"
```

A multi-line string (literal newlines are not allowed — use `\n`):

```json
"Line one\nLine two\nLine three"
```

A copyright symbol using Unicode escape:

```json
"\u00A9 2024 JSON Prism"
```

An emoji using a Unicode surrogate pair:

```json
"\uD83D\uDE80"
```

## What happens if you include a raw newline?

A real newline character inside a JSON string is invalid. This will cause a parse error:

```json
{
  "note": "line one
line two"
}
```

Use `\n` instead:

```json
{
  "note": "line one\nline two"
}
```

## Do you need to escape forward slashes?

No. The JSON spec allows `\/` as an escape for `/`, but it is entirely optional. Both of these are valid:

```json
{"url": "https://example.com/api"}
```

```json
{"url": "https:\/\/example.com\/api"}
```

Some older JSON generators escape forward slashes by default. Both forms parse identically.

## Escaping in practice

Most programming languages and JSON libraries handle escaping automatically when you serialize data. You only need to think about escaping when you are writing raw JSON by hand or building JSON strings through string concatenation (which you should avoid — use a serializer instead).

## Try it in JSON Prism

If your JSON contains escaped characters and you are unsure whether they are correct, paste it into the [JSON Formatter](/tools/json-formatter/) — it will display the actual decoded values clearly. For the underlying rules that govern all JSON strings, see [JSON Syntax Rules](/learn/syntax-rules/).
