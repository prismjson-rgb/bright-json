# Learn content — simple Markdown authoring

Each article is a `.md` file. The filename (without `.md`) becomes the URL slug, e.g. `what-is-json.md` → `/learn/what-is-json/`.

## Frontmatter (YAML)

```yaml
---
title: "Article Title"           # Required; quote if it contains colons
level: beginner                  # beginner | comfortable | practical | intermediate | advanced | expert
order: 1                         # Sort order (lower = first)
metaTitle: "SEO title"           # Optional; for <title> and Open Graph
metaDescription: "SEO blurb"     # Optional; for meta description
keyTerms: [JSON, API]            # Optional; shown as tags
tryExample: '{"key": "value"}'   # Optional; JSON to show with "Try in JSON Prism" button
excerpt: "Short preview"         # Optional; for in-app panel; otherwise auto from first para
---
```

**Tip:** Quote values that contain colons (e.g. `title: "JSON: A Guide"`).

## Body (Markdown)

Use standard Markdown:

- **Paragraphs** — normal text
- **Lists** — `-` bullets, `1.` numbered
- **Headings** — `##` for subsections
- **Code blocks** — use ` ```json ` for JSON (shows "Try in JSON Prism" button)
- **Inline code** — `` `code` ``

### Code block languages

- ` ```json ` — JSON with "Try in JSON Prism" button
- ` ```text ` or ` ``` ` — plain code, no button

## Regenerating

After editing, run:

```bash
npm run generate:content
```

Or start dev (`npm run dev`) — it runs the generator automatically.
