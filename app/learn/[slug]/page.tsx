import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTutorialSections,
  getSectionById,
  LEARN_LEVELS,
} from "@/lib/learn-content";
import { LearnArticlePage } from "@/components/LearnArticlePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

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

  const title = section.metaTitle || section.title;
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
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE}/og-image.png`],
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
    publisher: {
      "@type": "Organization",
      name: "JSON Prism",
      url: `${BASE}/`,
      logo: { "@type": "ImageObject", url: `${BASE}/icons/icon-512.png`, width: 512, height: 512 },
    },
    image: { "@type": "ImageObject", url: `${BASE}/og-image.png`, width: 1200, height: 630 },
    url: `${BASE}/learn/${slug}/`,
    datePublished: section.publishedAt || "2025-12-01",
    dateModified: section.updatedAt || section.publishedAt || "2025-12-01",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/learn/${slug}/` },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Learn", item: `${BASE}/learn/` },
      { "@type": "ListItem", position: 3, name: section.title, item: `${BASE}/learn/${slug}/` },
    ],
  };

  return (
    <SiteLayout activeNav="learn">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {levelInfo && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 mb-6">
            {levelInfo.label}
          </p>
        )}
        <LearnArticlePage
          section={section}
          prev={prev ? { id: prev.id, title: prev.title } : undefined}
          next={next ? { id: next.id, title: next.title } : undefined}
        />
      </main>
    </SiteLayout>
  );
}
