# JSON Prism

A browser-based JSON workspace with a static Next.js frontend, Markdown tutorials, and a Cloudflare KV short-link service.

## Architecture

- `app/`: static routes, metadata, and sitemap.
- `src/`: React workspace, JSON utilities, IndexedDB, and browser compression worker.
- `content/`: tutorials, tool pages, and informational pages; generated TypeScript is not committed.
- `worker/`: short links and donations; production retains the existing Worker and KV namespace.
- `redirect/`: canonical redirect from `www.jsonprism.com` to `jsonprism.com`.
- `theme-kit/`: shared design tokens and components.

Build output is **`out/`**. The frontend needs no Next.js server or server-rendering adapter on Cloudflare.

## Development (Node.js 22)

```sh
npm ci
npm ci --prefix worker
npm run dev
```

For local short links, copy `.env.example` to `.env.local`, then run `npm run dev --prefix worker` in another terminal. Frontend: port 3000; API: port 8787. Donations default to disabled locally.

## Validation and preview

```sh
npm run check
npm run typecheck --prefix worker
npm run build:production
npm run verify:export
npm start
```

`npm start` serves the static export in Cloudflare's local runtime. `next start` is incompatible with static export. Use `npm run build:production` for production. Deployment builds derive frontend URLs from `worker/wrangler.jsonc` so API URLs and CORS stay aligned.

## Deployment

Read [the Cloudflare runbook](docs/cloudflare-deployment.md) and [codebase review](docs/codebase-review.md).

```sh
npm run deploy:production --prefix worker
npm run deploy:production
npx wrangler deploy --config redirect/wrangler.jsonc --env production
node scripts/verify-deployment.mjs
```

GitHub Actions validates pull requests. A merge into `main` validates the merged code, then automatically deploys the API, frontend, and canonical redirect to production and checks the live commit. There is no staging environment. The `Production` GitHub environment holds the scoped Cloudflare deployment secret.

Edit Markdown in `content/`; builds regenerate it automatically. See [content authoring](content/README.md) and [theme kit](theme-kit/README.md).
