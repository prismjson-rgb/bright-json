## Bright JSON – Static Next.js App with Base Theme Kit

This repo is a static Next.js app for working with JSON (format, validate, diff, convert) plus a **modular Base Theme Kit** you can reuse across B2B technical SaaS projects.

The theme kit provides:

- **Semantic design tokens** for surfaces, text, accents, status, gradients, and code/diff states (light + dark).
- **Tailwind configuration** wired to CSS variables for easy theming.
- **Typography helpers** and a small component starter set (Button, Card, Input, Badge, Table, CodePanel, DiffLine).

The JSON tooling UI is built with React, Tailwind CSS, and shadcn-ui primitives on top of this design system.

## Tech stack

- Next.js (App Router, static export)
- React 18
- TypeScript
- Tailwind CSS (+ `tailwindcss-animate`)
- shadcn-ui primitives

## Theme kit structure

The design system lives in `/theme-kit`:

- `tokens/palette.base.ts` – raw color palette (slate, blue, copper, purple).
- `tokens/theme.semantic.ts` – semantic token helpers (bg, surface, text, status, gradients).
- `tailwind.config.ts` – example Tailwind `extend` config using semantic tokens.
- `globals.css` – light/dark CSS variables, gradients, code/diff tokens, base typography.
- `typography.ts` – ergonomic text-style helpers.

Core starter components using these tokens live in `src/components/theme-kit`.

## Content (no database)

All content lives in markdown files under `content/`:

- `content/learn/` — tutorial articles → `/learn/*`
- `content/pages/` — static pages → `/about`, `/privacy`, etc.

Add or remove `.md` files and run `npm run generate:content`. Editable via IDE or GitHub.

See `content/README.md` for authoring details.

## Running locally

```sh
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Building a static site

This project is configured for static export via `next.config.ts`:

```sh
npm run build
npm run start           # serves the built app
```

Or export static assets:

```sh
npm run build
```

The output is in `.next` and can be deployed to any static host (e.g. Vercel static export, Netlify, GitHub Pages behind a Node adapter, etc.).

