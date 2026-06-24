---
title: "JSON in Go: Marshal, Unmarshal, and Struct Tags"
metaTitle: "JSON in Go: Struct Tags, Marshal & Unmarshal"
metaDescription: "Go's encoding/json maps JSON to structs via tags. Learn Marshal/Unmarshal, omitempty, the exported-field rule, and how to handle unknown shapes."
level: advanced
order: 56
keyTerms: [go json, encoding/json, struct tags, marshal, omitempty]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Go's standard `encoding/json` package converts between JSON and Go values. `json.Marshal` turns a value into JSON bytes; `json.Unmarshal` parses JSON bytes into a value. **Struct tags** map field names, and only **exported (capitalized) fields** are encoded. The biggest gotchas are the exported-field rule and `omitempty`. Validate the JSON shape you're targeting with the [JSON Validator](/tools/json-validator/).

## Marshal and Unmarshal with structs

You describe the shape with a struct and tags:

```go
type User struct {
    ID     int    `json:"id"`
    Name   string `json:"name"`
    Email  string `json:"email,omitempty"`
    active bool   // unexported — ignored by JSON
}

// Go → JSON
b, _ := json.Marshal(User{ID: 1, Name: "Ada"})
// {"id":1,"name":"Ada"}

// JSON → Go
var u User
json.Unmarshal([]byte(`{"id":1,"name":"Ada"}`), &u)
```

Two rules trip up newcomers immediately:

- **Only exported fields are (un)marshaled.** `active` (lowercase) is invisible to `encoding/json` — it's never written and never filled. If a field isn't appearing in your JSON, check its capitalization first.
- **Unmarshal needs a pointer** (`&u`), so it can write into your value.

## Struct tags in detail

The tag controls the JSON key and options:

```go
Name  string `json:"name"`            // rename the key
Email string `json:"email,omitempty"` // omit if empty
Temp  string `json:"-"`               // never marshal this field
Count int    `json:"count,string"`    // encode the number as a JSON string
```

`omitempty` drops the field when it holds its **zero value** (`0`, `""`, `false`, `nil`, empty slice/map). This is handy but sharp-edged: a real `false` or `0` you *wanted* to send will silently vanish. When the difference between "absent" and "zero" matters — see [null vs missing](/learn/json-null-vs-missing/) — use a pointer (`*bool`) so `nil` means absent and `&false` means a real false.

## Handling unknown or dynamic shapes

When you don't have a struct for the data, unmarshal into a generic type:

```go
var data map[string]interface{}
json.Unmarshal(raw, &data)
```

Numbers then arrive as `float64` (Go's default for JSON numbers), which can lose precision on large integers — see [Big Numbers in JSON](/learn/json-big-numbers/). To keep big integers exact, use a `json.Decoder` with `UseNumber()`, which yields a `json.Number` you can convert deliberately:

```go
dec := json.NewDecoder(bytes.NewReader(raw))
dec.UseNumber()
```

For pretty output, use `json.MarshalIndent(v, "", "  ")`. To store these values in PostgreSQL, see [JSON in PostgreSQL](/learn/json-in-postgres/), where a Go struct maps to a `jsonb` column via `Value()`/`Scan()`.

## Frequently asked questions

**Why is my Go struct field missing from the JSON?**
Most likely it's unexported (starts with a lowercase letter). `encoding/json` only marshals exported fields. Capitalize the field and use a `json:"..."` tag to set the key name.

**What does omitempty do?**
It omits the field from the output when its value is the type's zero value (`0`, `""`, `false`, `nil`). Be careful: a legitimate `false` or `0` will be dropped. Use a pointer if you need to distinguish zero from absent.

**Why do my JSON numbers become float64 in Go?**
When unmarshaling into `interface{}`, Go represents all JSON numbers as `float64`, which can lose precision for large integers. Use a decoder with `UseNumber()` to get exact `json.Number` values.

**How do I parse JSON without a struct in Go?**
Unmarshal into `map[string]interface{}` or `interface{}` for arbitrary shapes. You then type-assert values as you read them. Defining a struct is preferable when the shape is known.
