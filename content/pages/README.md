# Static pages

Each `.md` file becomes a route. Filename = slug (e.g. `about.md` → `/about/`).

## Frontmatter

```yaml
---
title: "Page Title"           # Required
metaTitle: "SEO title"        # Optional
metaDescription: "SEO blurb"  # Optional
---
```

## Add a page

1. Create `content/pages/your-slug.md`
2. Add frontmatter + markdown body
3. Run `npm run generate:content` (or `npm run dev`)

## Remove a page

1. Delete the `.md` file
2. Regenerate

Reserved slugs (cannot use): `learn`, `bundle`, `api`
