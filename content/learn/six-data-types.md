---
title: The Six JSON Data Types
level: beginner
order: 3
metaTitle: "JSON Data Types: String, Number, Boolean, Null, Object, Array"
metaDescription: "JSON supports exactly six data types. Learn strings, numbers, booleans, null, objects, and arrays with examples."
keyTerms: [string, number, boolean, null, object, array]
---

JSON has exactly six data types. Understanding these is the foundation of working with JSON.

## String

A sequence of characters wrapped in double quotes. Use backslash for escaping: `\"` for quotes, `\\` for backslash, `\n` for newline.

```json
"Hello, World!"
```

```json
"Escaped: \"quote\" and \\backslash\\"
```

```json
"Line 1\nLine 2"
```

## Number

Integers or decimals. No quotes. Scientific notation allowed.

```json
42
```

```text
3.14
-100
1.5e10
```

## Boolean

Logical values. Must be lowercase: true or false.

```json
true
```

```json
false
```

## Null

Represents absence of value. Always lowercase null.

```json
null
```

## Object

Unordered collection of key-value pairs in curly braces. Keys must be strings.

```json
{"name": "Alice", "age": 30, "active": true}
```

## Array

Ordered list of values in square brackets. Values can be any type.

```json
["red", "green", "blue"]
```

```json
[1, 2, 3, 4, 5]
```

```json
[true, false, null]
```
