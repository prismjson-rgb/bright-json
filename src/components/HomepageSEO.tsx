import Link from "next/link";
import { getTutorialSections } from "@/lib/learn-content";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

const FEATURES = [
  {
    title: "JSON Formatter & Beautifier",
    description:
      "Instantly format messy, minified, or hand-written JSON into clean, indented output. Configurable indent width and optional alphabetical key sorting.",
  },
  {
    title: "JSON Validator",
    description:
      "Real-time syntax validation with inline error highlighting, exact line and column positions, and safe auto-fixes for common mistakes.",
  },
  {
    title: "Collapsible Tree View",
    description:
      "Navigate deeply nested JSON with an interactive tree. Expand, collapse, or jump to matches with in-browser search (Ctrl/Cmd+K).",
  },
  {
    title: "Visual (No-Code) Editor",
    description:
      "Edit objects and arrays through form fields. Changes stay in sync with the raw JSON — ideal for non-developers reviewing config.",
  },
  {
    title: "Flow / Graph View",
    description:
      "Explore large structures as an interactive node graph. Pan, zoom, and drag nodes to understand relationships at a glance.",
  },
  {
    title: "JSON Diff Viewer",
    description:
      "Side-by-side compare of two JSON documents with added, removed, and changed keys color-coded for fast review.",
  },
  {
    title: "JSON to YAML / XML / CSV",
    description:
      "Convert valid JSON to YAML, XML, or CSV with a single click. Copy the output or download it as a file.",
  },
  {
    title: "JSON Debugger",
    description:
      "Inspect parse errors, jump to the failing position, and apply targeted auto-fixes for missing commas, mismatched brackets, and bad escapes.",
  },
  {
    title: "JSON Trimmer",
    description:
      "Strip comments, trailing commas, and extra whitespace to turn JSON5-style input into strict, standards-compliant JSON.",
  },
  {
    title: "AI Response Cleaner",
    description:
      "Extract and clean JSON from messy LLM output — code fences, prose, and partial results included.",
  },
  {
    title: "Minimal Mode (Path Filter)",
    description:
      "Include or exclude specific paths to produce a smaller JSON subset from the same document, with a live size-savings indicator.",
  },
  {
    title: "Structure Analyzer",
    description:
      "At-a-glance stats: key counts, type mix, nesting depth, and payload size for quick complexity review.",
  },
  {
    title: "Best Practices Checker",
    description:
      "Heuristic audit for nesting depth, naming consistency, payload size, and other maintainability issues.",
  },
  {
    title: "Token Estimator for LLMs",
    description:
      "Approximate token counts for LLM context windows. Compare JSON vs YAML and XML to pick the cheapest format.",
  },
  {
    title: "Mock JSON Generator",
    description:
      "Generate realistic sample JSON from templates or custom fields. Useful for prototyping APIs and UI components.",
  },
  {
    title: "Share via URL & Short Links",
    description:
      "Encode JSON directly into a shareable link (nothing uploaded), or opt into 30-day short links via our Cloudflare Worker for longer payloads.",
  },
  {
    title: "Bundle Multiple JSONs",
    description:
      "Combine several JSON documents into one shareable link — like a Linktree for JSON — openable in the bundle viewer.",
  },
  {
    title: "Load from URL & Drag-Drop",
    description:
      "Import JSON directly from a URL or drop a .json / .txt file onto the editor — no file picker required.",
  },
];

const FAQS = [
  {
    question: "Is JSON Prism free to use?",
    answer:
      "Yes. JSON Prism is completely free with no sign-up, no ads, and no usage limits. It runs entirely in your browser.",
  },
  {
    question: "Does JSON Prism send my JSON to a server?",
    answer:
      "No. All parsing, formatting, validation, and conversion happen locally in your browser. Your JSON never leaves your device unless you explicitly opt into a 30-day short link, which stores only the already-encoded payload.",
  },
  {
    question: "Can JSON Prism handle large JSON files?",
    answer:
      "Yes. The editor uses Monaco (same engine as VS Code) and the tree view virtualizes large documents. Tabs and content persist in IndexedDB so large files remain responsive.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Yes, once loaded. JSON Prism is a static web app with no server-side processing, so it continues to work without a network connection.",
  },
  {
    question: "Can I share a JSON document with someone?",
    answer:
      "Yes. Use Share via Link to generate a URL that encodes your JSON in the URL fragment — nothing is uploaded. For very large payloads, opt into a short link that stores the encoded payload on our Cloudflare KV for 30 days.",
  },
  {
    question: "What formats can JSON Prism convert to?",
    answer:
      "YAML, XML, and CSV. Conversion is one-click from the Convert panel. Output is read-only; edit the source JSON on the left to change it.",
  },
  {
    question: "Does JSON Prism support JSON5 or JSON with comments?",
    answer:
      "The Trimmer panel strips comments, trailing commas, and JSON5-style extras to produce strict JSON. The Debugger also applies safe auto-fixes for common problems.",
  },
  {
    question: "Is my data stored anywhere?",
    answer:
      "Only on your own device — tabs, editor content, notes, and settings are saved in IndexedDB, and the theme preference in localStorage. Clearing site data removes everything.",
  },
];

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JSON Prism",
  url: `${BASE}/`,
  description:
    "Free online JSON formatter, validator, tree viewer, graph view, diff, debugger, and YAML/XML/CSV converter. Runs entirely in the browser.",
  publisher: {
    "@type": "Organization",
    name: "JSON Prism",
    url: `${BASE}/`,
    logo: {
      "@type": "ImageObject",
      url: `${BASE}/logo.png`,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const APP_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JSON Prism",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: `${BASE}/`,
  description:
    "Free online JSON formatter, validator, tree viewer, graph view, diff, debugger, and YAML/XML/CSV converter. Runs entirely in the browser — nothing is uploaded by default.",
  publisher: {
    "@type": "Organization",
    name: "JSON Prism",
    url: `${BASE}/`,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "JSON formatting and beautification",
    "JSON syntax validation with inline errors",
    "Collapsible tree view",
    "Visual (form-based) no-code editor",
    "Interactive flow / graph view",
    "JSON diff and comparison",
    "JSON to YAML conversion",
    "JSON to XML conversion",
    "JSON to CSV conversion",
    "JSON debugger with auto-fix",
    "JSON trimmer (strict-mode cleanup)",
    "AI response cleaner (LLM output to JSON)",
    "Minimal mode / path-based filtering",
    "Structure analyzer",
    "Best-practices checker",
    "Token estimator for LLMs",
    "Mock JSON generator",
    "In-browser search across keys and values",
    "JSON minification",
    "Rich-text notes beside your session",
    "Share via URL fragment (no upload)",
    "Opt-in 30-day short links",
    "Bundle multiple JSONs into one link",
    "Import from URL or drag-drop",
  ],
  screenshot: `${BASE}/og-image.png`,
};

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function HomepageSEO() {
  const learnSections = getTutorialSections().slice(0, 8);

  return (
    <section aria-label="About JSON Prism" className="border-t border-border bg-surface2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* H1 — primary keyword target for the homepage */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Free Online JSON Formatter, Validator, Tree Viewer &amp; Diff Tool
        </h1>
        <p className="text-muted-foreground text-base max-w-3xl mb-12 leading-relaxed">
          JSON Prism is a fast, privacy-first JSON workspace that runs entirely in your browser.
          Paste or type JSON above to format, validate, diff, debug, convert, and explore your data
          with tree, visual, and graph views — no sign-up, no uploads by default.
        </p>

        {/* Feature grid */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-foreground mb-6">What you can do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-surface1 p-4"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ — drives FAQ rich results */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold text-foreground mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.question}
                className="group rounded-xl border border-border bg-surface1 p-4"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-foreground flex items-center justify-between">
                  {f.question}
                  <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Learn section — drives internal linking and content depth */}
        <div className="mb-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Learn JSON</h2>
            <Link href="/learn/" className="text-sm text-primary hover:underline">
              All tutorials →
            </Link>
          </div>
          <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
            New to JSON or want to deepen your knowledge? Our free tutorial covers everything from
            basic syntax to JSON Schema, JSONPath, REST APIs, and security.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {learnSections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/learn/${s.id}/`}
                  className="block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{s.title}</span>
                  {s.metaDescription && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {s.metaDescription}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy + trust signal */}
        <div className="rounded-xl border border-border bg-surface1 p-6 mb-10">
          <h2 className="text-base font-semibold text-foreground mb-2">Privacy by design</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every operation in JSON Prism runs locally in your browser using JavaScript. No JSON
            data is uploaded, stored, or shared by default. Short links are strictly opt-in and
            store only the compressed payload on our own Cloudflare KV for 30 days. You can safely
            use JSON Prism with confidential API responses, internal configs, and sensitive data.
          </p>
        </div>

        {/* Footer nav */}
        <nav aria-label="Site links" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/learn/" className="text-primary hover:underline">
            JSON Tutorial
          </Link>
          <Link href="/about/" className="hover:text-foreground hover:underline transition-colors">
            About
          </Link>
          <Link href="/privacy/" className="hover:text-foreground hover:underline transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms/" className="hover:text-foreground hover:underline transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </section>
  );
}
