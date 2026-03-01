---
title: Escaping and Special Characters
level: intermediate
order: 13
keyTerms: []
---

Inside JSON strings, certain characters must be escaped with a backslash: `\"` (quote), `\\` (backslash), `\b` (backspace), `\f` (form feed), `\n` (newline), `\r` (carriage return), `\t` (tab). Unicode can be written as `\uXXXX`.

```json
"Quote: \"Hello\""
```

```json
"Tab: col1\tcol2"
```

```json
"Newline: line1\nline2"
```

```json
"Unicode: \u00A9 (copyright)"
```
