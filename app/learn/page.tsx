import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_LEVELS, getSectionsByLevel, getTutorialSections } from "@/lib/learn-content";
import { getLearnIndexContent } from "@/lib/site-content";
import { SiteLayout } from "@/components/site/SiteLayout";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";
const content = getLearnIndexContent();

const TITLE = `${content.heroTitle || content.title} | JSON Prism`;
const DESCRIPTION = content.heroDescription || "Master JSON with focused tutorials covering basics, APIs, JSON Schema, JSONPath, and more.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["JSON tutorial", "learn JSON", "JSON for beginners", "JSON syntax", "JSON data types", "JSON Schema", "JSONPath", "REST API JSON"],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "JSON Prism",
    url: `${BASE}/learn/`,
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${BASE}/og-image.png`],
  },
  alternates: { canonical: `${BASE}/learn/` },
};

const courseLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: content.heroTitle || "Complete JSON Tutorial — From Beginner to Expert",
  description: DESCRIPTION,
  provider: { "@type": "Organization", name: "JSON Prism", url: `${BASE}/` },
  hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT5H" },
  hasPart: getTutorialSections().map((s) => ({
    "@type": "LearningResource",
    name: s.title,
    url: `${BASE}/learn/${s.id}/`,
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Learn JSON", item: `${BASE}/learn/` },
  ],
};

export default function LearnIndexPage() {
  return (
    <SiteLayout activeNav="learn">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(courseLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-20">
        {content.heroEyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            {content.heroEyebrow}
          </p>
        )}
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          {content.heroTitle || content.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {content.heroDescription}
        </p>
        {content.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <nav aria-label="Tutorial index" className="mt-14 space-y-12">
          {LEARN_LEVELS.map((level, levelIdx) => {
            const sections = getSectionsByLevel(level.id);
            if (sections.length === 0) return null;
            return (
              <section key={level.id}>
                <h2 className="text-xl font-semibold text-white pb-3 border-b border-white/10">
                  {levelIdx + 1}. {level.label}
                </h2>
                <p className="mt-2 mb-5 text-sm text-slate-400">{level.description}</p>
                <ul className="space-y-3">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/learn/${s.id}/`}
                        className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/[0.05] group"
                      >
                        <span className="font-semibold text-white group-hover:text-cyan-200 transition-colors">
                          {s.title}
                        </span>
                        {s.metaDescription && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
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

        {(content.whyTitle || content.whyBody) && (
          <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            {content.whyTitle && (
              <h3 className="text-sm font-semibold text-white mb-2">{content.whyTitle}</h3>
            )}
            {content.whyBody && (
              <p className="text-sm text-slate-400">{content.whyBody}</p>
            )}
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
