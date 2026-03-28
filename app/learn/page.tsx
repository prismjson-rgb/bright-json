import type { Metadata } from "next";
import Link from "next/link";
import {
  LEARN_LEVELS,
  getSectionsByLevel,
  getTutorialSections,
} from "@/lib/learn-content";

const TITLE = "JSON Tutorial — Complete Guide from Beginner to Expert | JSON Prism";
const DESCRIPTION =
  "Master JSON free. 18 articles: basics, data types, REST APIs, JSON Schema, JSONPath, security, and more. Each topic has its own page for focused learning.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "JSON tutorial",
    "learn JSON",
    "JSON for beginners",
    "JSON syntax",
    "JSON data types",
    "JSON Schema",
    "JSONPath",
    "REST API JSON",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "JSON Prism",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com"}/learn/`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com"}/learn/`,
  },
};

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

const JSON_LD_COURSE = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Complete JSON Tutorial — From Beginner to Expert",
  description: DESCRIPTION,
  provider: { "@type": "Organization", name: "JSON Prism", url: `${BASE}/` },
  hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT1H" },
  hasPart: getTutorialSections().map((s) => ({
    "@type": "LearningResource",
    name: s.title,
    url: `${BASE}/learn/${s.id}/`,
  })),
};

export default function LearnIndexPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_COURSE) }}
      />

      <header className="border-b border-border bg-surface1 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold">JSON Prism</span>
            <span className="text-muted-foreground text-sm">/ Learn</span>
          </Link>
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to JSON Tools
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Complete JSON Tutorial — From Beginner to Expert
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Master JSON (JavaScript Object Notation) from the ground up. Each topic has its own
            page — pick one below or follow the learning path in order.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["JSON basics", "REST APIs", "JSON Schema", "JSONPath", "Security"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <nav aria-label="Tutorial index" className="space-y-10">
          {LEARN_LEVELS.map((level, levelIdx) => {
            const sections = getSectionsByLevel(level.id);
            if (sections.length === 0) return null;
            return (
              <section key={level.id}>
                <h2 className="text-xl font-semibold text-foreground mb-2 border-b border-border pb-2">
                  {levelIdx + 1}. {level.label}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">{level.description}</p>
                <ul className="space-y-2">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/learn/${s.id}/`}
                        className="block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {s.title}
                        </span>
                        {s.metaDescription && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {s.metaDescription}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>

        <div className="mt-12 p-4 rounded-xl bg-surface2 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">Why separate pages?</h3>
          <p className="text-sm text-muted-foreground">
            Each tutorial topic has its own URL for better SEO and focused learning. You can share
            a specific article, bookmark it, or let search engines index it. Start with{" "}
            <Link href="/learn/what-is-json/" className="text-primary hover:underline">
              What is JSON?
            </Link>{" "}
            or jump to any topic above.
          </p>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>
          Part of{" "}
          <Link href="/" className="text-primary hover:underline">
            JSON Prism
          </Link>
          — Format, validate, diff, and explore JSON. No data stored. Works offline.
        </p>
      </footer>
    </div>
  );
}
