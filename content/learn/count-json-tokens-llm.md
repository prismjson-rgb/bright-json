---
title: "How to Count JSON Tokens for LLMs"
metaTitle: "Count JSON Tokens for LLMs (Cut Context Cost)"
metaDescription: "JSON is token-heavy in LLM prompts. Learn how tokens are counted, why JSON costs more than YAML, and how to shrink payloads to fit context windows."
level: advanced
order: 26
keyTerms: [json tokens, llm context, token count, token estimator, prompt cost]
relatedTools: [json-token-estimator, ai-json-cleaner]
relatedLearn: [performance-large-files, fixing-llm-json]
publishedAt: "2026-06-16"
updatedAt: "2026-06-16"
---

**Quick answer:** LLMs bill and limit by **tokens**, and JSON is token-expensive because every brace, quote, comma, and repeated key counts. To estimate a payload's cost, paste it into the [JSON Token Estimator](/tools/json-token-estimator/), which approximates token counts and compares JSON against YAML so you can pick the cheapest representation for a prompt or context window.

## What a token is

A token is a chunk of text — roughly ¾ of a word in English, but for structured data it's often a single character or symbol. Models don't see your JSON as data; they see a sequence of tokens. That means the *punctuation* of JSON is not free:

```json
{"user":{"name":"Dana","active":true}}
```

Every `{`, `}`, `"`, `:`, and `,` is tokens the model must process — and that you pay for on metered APIs. The same data carries a lot of structural overhead beyond the actual values.

## Why JSON is token-heavy

- **Quotes on every key and string** — `"name"` costs more tokens than a bare `name`.
- **Repeated keys** — an array of 1,000 objects repeats every key 1,000 times.
- **Braces, brackets, and commas** at every level of nesting.
- **Whitespace** — pretty-printed JSON adds indentation tokens. (Minify before sending to a model.)

This is why feeding large JSON into a prompt burns through a context window fast and inflates cost.

## How to estimate before you send

1. Paste your JSON into the [JSON Token Estimator](/tools/json-token-estimator/).
2. Read the approximate token count for the payload as-is.
3. Compare the JSON estimate against the YAML estimate the tool shows — YAML often uses fewer tokens because it drops quotes and braces.
4. Decide whether the payload fits your model's context budget, or needs trimming.

Token counts are *approximate* — each model family uses its own tokenizer — but a good estimate is enough to catch a payload that's about to blow your budget.

## How to shrink a payload

- **Minify it.** Strip pretty-printing whitespace before sending — use the [JSON Formatter](/tools/json-formatter/) in minify mode. The data is identical; the token count drops.
- **Send only what's needed.** Use [Minimal Mode](/tools/json-minimal-mode/) to include or exclude paths and produce a smaller subset, instead of pasting the whole document.
- **Consider a more compact format.** For some prompts, YAML or a tabular form conveys the same data in fewer tokens. The estimator's side-by-side comparison shows the difference.
- **Drop redundant nesting.** Flatten where the structure isn't load-bearing for the model's task.

For background on why compact vs readable JSON matters, see [Pretty vs Minified JSON](/learn/pretty-vs-minified/), and for cleaning up the JSON that models *return*, see [Fixing Broken LLM JSON](/learn/fixing-llm-json/).

## Frequently asked questions

**How many tokens is my JSON?**
It depends on the content and the model's tokenizer, but JSON's quotes, braces, and repeated keys add substantial overhead. Estimate it with the [JSON Token Estimator](/tools/json-token-estimator/).

**Does JSON use more tokens than YAML?**
Usually yes. YAML omits most quotes and braces, so the same data often tokenizes smaller — which is why the estimator compares the two.

**Does minifying JSON reduce tokens?**
Yes. Removing pretty-print whitespace lowers the token count without changing the data. Minify before putting JSON in a prompt.

**Why does my JSON exceed the context window?**
Large arrays repeat every key per element and nesting adds punctuation tokens. Trim to the needed paths with [Minimal Mode](/tools/json-minimal-mode/) or send a more compact format.
