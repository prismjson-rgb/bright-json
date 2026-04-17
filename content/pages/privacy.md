---
title: "Privacy Policy"
metaTitle: "Privacy Policy — JSON Prism"
metaDescription: "JSON Prism runs locally in your browser. No JSON is transmitted or stored on any server by default. Short links are strictly opt-in."
---

JSON Prism ("we", "our", or "the app") is a fully client-side, browser-based JSON utility. We are committed to your privacy. This policy explains what data is — and is not — collected when you use JSON Prism.

## Data we do not collect

JSON Prism processes all JSON data entirely in your browser. We do not:

- Transmit, upload, or store any JSON content you paste or type
- Collect personal information or create user accounts
- Use cookies for tracking or advertising
- Share any data with third parties
- Run any server-side processing of your data

## Browser storage

JSON Prism stores data only on your device using `localStorage` for theme preference and `IndexedDB` for tabs, editor content, settings, notes, and saved JSON (larger payloads use async storage so the page stays responsive).

- **Theme preference** (light or dark) — key: `json-viewer-theme`
- **Tabs and editor content** — stored in IndexedDB under the app's origin
- **Settings** (editor, tree, formatting preferences) — stored in IndexedDB
- **Notes** (rich-text annotations beside your session) — stored in IndexedDB

This data never leaves your device and can be cleared at any time by clearing site data from your browser.

## Share links

When you use the Share feature, your JSON is compressed and encoded directly into the URL fragment (the portion after `#`). Browsers **do not send URL fragments to servers**, so the payload never reaches any server — the link is decoded locally by whoever opens it.

## Optional short links

If you click **Create short link** in the Share panel, the already-encoded payload (not your original JSON) is sent to our own Cloudflare Worker and stored in Cloudflare Workers KV for **30 days**, then automatically deleted. The short link service is never contacted unless you explicitly press that button. We store only the compressed payload — we never see your original JSON.

- Stored value: the compressed, base64url-encoded payload only
- Retention: 30 days, auto-deleted
- Data location: Cloudflare KV (globally distributed edge storage)
- No IP addresses, user agents, or request metadata are logged

## Analytics

We use Google Tag Manager for aggregate, privacy-preserving usage analytics (page views, feature usage). GTM loads after the page is interactive to avoid blocking performance. No JSON content or identifiable user data is sent to analytics.

## Third-party libraries

JSON Prism is built with open-source libraries (Next.js, Monaco Editor, Tailwind CSS, shadcn/ui, and others). These run entirely in the browser and do not transmit your JSON content.

## Changes to this policy

We may update this policy from time to time. Changes are effective immediately upon posting. Continued use of the app constitutes acceptance of the revised policy.

## Contact

For questions, please open an issue on the project's GitHub repository.
