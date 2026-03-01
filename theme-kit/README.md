## Base Theme Kit

This folder contains a reusable, modular theme kit for B2B technical SaaS projects. It is designed to be copied into new apps and wired into Tailwind + Next.js with minimal changes.

### What’s included

- **Design tokens**
  - `tokens/palette.base.ts` – raw, stable color palette (slate, blue, copper, purple).
  - `tokens/theme.semantic.ts` – semantic token helpers (bg, surface, text, status, gradients).
- **Tailwind config**
  - `tailwind.config.ts` – example Tailwind `extend` config wired to the tokens and CSS variables.
- **Global styles**
  - `globals.css` – light/dark CSS variables for surfaces, text, accents, gradients, code editor, and diff states, plus base typography.
- **Typography helpers**
  - `typography.ts` – small type-scale helpers for headings and body copy.

### Usage in a new app

1. **Copy the folder**
   - Copy `/theme-kit` into the root of your new Next.js/Tailwind app.

2. **Hook up Tailwind**
   - Either:
     - Replace the app’s `tailwind.config.{js,ts}` with `theme-kit/tailwind.config.ts`, or
     - Merge the `extend` section into your existing Tailwind config.

3. **Hook up globals**
   - Import `theme-kit/globals.css` from your app-level CSS (e.g. `app/globals.css`):

```css
@import "../theme-kit/globals.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. **Use semantic tokens in components**
   - Surfaces: `bg-bg`, `bg-surface1`, `bg-surface2`
   - Text: `text-text1`, `text-text2`, `text-text3`, `text-link`
   - Status: `bg-success-bg text-success`, `bg-error-bg text-error`, etc.
   - Gradients: `bg-grad-hero`, `bg-grad-divider`, `bg-grad-chip`

5. **Code + diff**
   - Use the CSS vars for editor and diff styling:
     - Code: `--code-bg`, `--code-border`, `--syntax-*`
     - Diff: `--diff-add*`, `--diff-del*`, `--diff-mod*`

This project’s root Tailwind config and `app/globals.css` are already wired to this kit, so the site can act as a reference implementation and starter for future products.

