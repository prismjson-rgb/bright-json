---
title: "Privacy Policy"
metaTitle: "Privacy Policy - JSON Prism"
metaDescription: "JSON Prism runs locally in your browser. No JSON is transmitted or stored on any server by default. Short links are strictly opt-in."
---

JSON Prism ("we", "our", or "the app") is a fully client-side, browser-based JSON utility. We are committed to your privacy. This policy explains what data is - and is not - collected when you use JSON Prism.

## Data we do not collect

Formatting, validation and conversion run in your browser. The optional network features described below send data only when you choose to use them. We do not:

- Automatically upload JSON content you paste or type
- Collect personal information or create user accounts
- Load advertising scripts
- Use your editor content for analytics

## Browser storage

JSON Prism stores data only on your device using `localStorage` for theme preference and `IndexedDB` for tabs, editor content, settings, notes, and saved JSON (larger payloads use async storage so the page stays responsive).

- **Theme preference** (light or dark) - key: `json-viewer-theme`
- **Tabs and editor content** - stored in IndexedDB under the app's origin
- **Settings** (editor, tree, formatting preferences) - stored in IndexedDB
- **Notes** (rich-text annotations beside your session) - stored in IndexedDB

This data never leaves your device and can be cleared at any time by clearing site data from your browser.

## Share links

When you use the Share feature, your JSON is compressed and encoded directly into the URL fragment (the portion after `#`). Browsers **do not send URL fragments to servers**, so the payload never reaches any server - the link is decoded locally by whoever opens it.

## Optional short links

If you click **Create short link** in the Share panel, a compressed, encoded copy of your content is sent to our Cloudflare Worker and stored in Cloudflare Workers KV for **30 days**, then automatically expires. Compression is **not encryption**: the stored payload can be decoded back into the original content. Anyone with the short link can access it while it is active. Creating a short link is optional; ordinary fragment links do not use this storage service.

- Stored value: the share type and compressed, encoded payload (JSON, bundle, or cURL content)
- Retention: 30 days, auto-deleted
- Data location: Cloudflare KV (globally distributed edge storage)
- The Worker application does not log request bodies or IP addresses. Cloudflare processes request metadata to serve requests and enforce rate limits.

## Analytics

JSON Prism uses Google Tag Manager (container `GTM-WMZSRR3M`) to load scripts for general usage tracking, product improvements, and standard product functionality. Google Tag Manager and the tags it loads may set cookies and collect aggregate usage data such as pages visited, referrer, and browser and device information, along with an approximate location derived from your IP address. This helps us understand overall usage and improve the app. The JSON content you paste, type, or edit is never sent to these scripts. Cloudflare also processes request metadata to deliver the site and protect its services.

## Requests and donations

When you run a URL/cURL request, your browser sends the URL, headers (including any credentials you supplied) and body to the destination you chose. That service may log the request and receives your IP address. Donation checkout sends payment-related information to Dodo Payments. Notes are saved per tab and are not included in JSON share links.

If device storage is blocked or full, the workspace displays a save warning. Download your JSON and notes before leaving; browser data can also be lost when you clear site data.

## Third-party libraries

JSON Prism is built with open-source libraries (Next.js, Monaco Editor, Tailwind CSS, shadcn/ui, and others). These run entirely in the browser and do not transmit your JSON content.

## Changes to this policy

We may update this policy from time to time. Changes are effective immediately upon posting. Continued use of the app constitutes acceptance of the revised policy.

## Contact

For questions, please open an issue on the project's GitHub repository.
