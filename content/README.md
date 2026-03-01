# Content — Markdown-driven, no database

All content lives in `.md` files. Editable via IDE or GitHub. No DB required.

## Folder structure

```
content/
├── learn/          → /learn/*  (tutorial articles)
│   ├── what-is-json.md
│   └── ...
├── pages/          → /about, /privacy, etc. (static pages)
│   ├── about.md
│   └── ...
└── README.md       (this file)
```

## Add a page

### Tutorial article (learn)

1. Create `content/learn/your-topic.md`
2. Add frontmatter (see `content/learn/README.md`)
3. Run `npm run generate:learn` (or `npm run dev`)
4. Page is live at `/learn/your-topic/`

### Static page

1. Create `content/pages/your-page.md`
2. Add frontmatter: `title`, optional `metaTitle`, `metaDescription`
3. Run `npm run generate:content` (or `npm run dev`)
4. Page is live at `/your-page/`

## Remove a page

1. Delete the `.md` file
2. Run the generator (or dev)
3. Page is gone (404)

## Regenerate content

```bash
npm run generate:content   # learn + pages
# or
npm run dev               # runs generator automatically
```
