import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTutorialSections,
  getSectionById,
  LEARN_LEVELS,
} from "@/lib/learn-content";
import { LearnArticlePage } from "@/components/LearnArticlePage";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://bright-json.vercel.app";

export function generateStaticParams() {
  return getTutorialSections().map((s) => ({ slug: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getSectionById(slug);
  if (!section) return { title: "Not Found" };

  const title = section.metaTitle || `${section.title} | JSON Tutorial`;
  const description =
    section.metaDescription ||
    `Learn about ${section.title} in this JSON tutorial. Part of the complete JSON guide from JSON Prism.`;

  return {
    title: `${title} | JSON Prism`,
    description,
    keywords: section.keyTerms ?? [],
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "JSON Prism",
      url: `${BASE}/learn/${slug}/`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE}/learn/${slug}/`,
    },
  };
}

export default async function LearnArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSectionById(slug);
  if (!section) notFound();

  const allSections = getTutorialSections();
  const idx = allSections.findIndex((s) => s.id === slug);
  const prev = idx > 0 ? allSections[idx - 1] : undefined;
  const next = idx >= 0 && idx < allSections.length - 1 ? allSections[idx + 1] : undefined;

  const levelInfo = LEARN_LEVELS.find((l) => l.id === section.level);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: section.title,
    description: section.metaDescription || section.contentMarkdown.slice(0, 160),
    author: { "@type": "Organization", name: "JSON Prism" },
    publisher: { "@type": "Organization", name: "JSON Prism" },
    url: `${BASE}/learn/${slug}/`,
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/learn/${slug}/` },
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          <Link href="/learn/" className="text-sm text-primary hover:underline">
            ← All tutorials
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {levelInfo && (
          <p className="text-sm text-muted-foreground mb-4">
            {levelInfo.label} · {section.title}
          </p>
        )}
        <LearnArticlePage
          section={section}
          prev={prev ? { id: prev.id, title: prev.title } : undefined}
          next={next ? { id: next.id, title: next.title } : undefined}
        />
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>
          Part of{" "}
          <Link href="/" className="text-primary hover:underline">
            JSON Prism
          </Link>
          — Format, validate, diff, and explore JSON. No data stored. Works offline.
        </p>
        <p className="mt-2">
          <Link href="/learn/" className="text-primary hover:underline">
            Browse all JSON tutorials →
          </Link>
        </p>
      </footer>
    </div>
  );
}
