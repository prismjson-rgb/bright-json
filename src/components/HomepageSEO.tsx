import Link from "next/link";
import { getTutorialSections } from "@/lib/learn-content";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

const FEATURES = [
  {
    title: "JSON Formatter & Beautifier",
    description:
      "Instantly format messy, minified, or hand-written JSON into clean, indented output with configurable indent levels.",
  },
  {
    title: "JSON Validator",
    description:
      "Validate JSON syntax in real time. Errors are highlighted inline with line numbers so you can fix issues immediately.",
  },
  {
    title: "JSON Diff Viewer",
    description:
      "Compare two JSON documents side-by-side. Added, removed, and changed keys are color-coded for fast review.",
  },
  {
    title: "JSON to YAML / XML / CSV",
    description:
      "Convert JSON to YAML, XML, or CSV with a single click. Copy the output or download it as a file.",
  },
  {
    title: "Collapsible Tree View",
    description:
      "Explore deeply nested JSON structures with an interactive, collapsible tree. Click any node to expand or collapse it.",
  },
  {
    title: "JSON Search",
    description:
      "Search across keys and values in large JSON documents. Results are highlighted and navigable with keyboard shortcuts.",
  },
  {
    title: "JSON Minifier",
    description:
      "Strip all whitespace from JSON to produce the smallest possible output for network transmission or storage.",
  },
  {
    title: "Mock JSON Generator",
    description:
      "Generate realistic mock JSON data from a schema. Useful for prototyping APIs or populating UI components.",
  },
  {
    title: "JSON Structure Analyzer",
    description:
      "Analyze JSON structure at a glance: key counts, nesting depth, data types, and potential schema inference.",
  },
];

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JSON Prism",
  url: `${BASE}/`,
  description:
    "Free online JSON formatter, validator, and beautifier. Format, minify, diff, convert to YAML/XML/CSV, and explore JSON with a tree view.",
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
    "Free online JSON formatter, validator, and beautifier. Format, minify, diff, convert to YAML/XML/CSV, and explore JSON with a tree view. Runs entirely in the browser — no data stored.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "JSON formatting and beautification",
    "JSON syntax validation",
    "JSON diff / comparison",
    "JSON to YAML conversion",
    "JSON to XML conversion",
    "JSON to CSV conversion",
    "Collapsible tree view",
    "In-browser JSON search",
    "JSON minification",
    "Mock JSON data generator",
    "JSON structure analyzer",
    "Token estimator for LLMs",
  ],
  screenshot: `${BASE}/icons/icon-512.png`,
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

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* H1 — primary keyword target for the homepage */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Free Online JSON Formatter, Validator &amp; Beautifier
        </h1>
        <p className="text-muted-foreground text-base max-w-3xl mb-12 leading-relaxed">
          JSON Prism is a fast, privacy-first JSON tool that runs entirely in your browser. Paste
          or type JSON above to format, validate, diff, convert, and explore your data — no sign-up
          required, no data sent to any server.
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
            data is ever transmitted to a server, stored in a database, or shared with third
            parties. You can safely use JSON Prism with confidential API responses, internal
            configs, and sensitive data.
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
