import type { Metadata } from "next";
import { LEARN_LEVELS, getTutorialSections } from "@/lib/learn-content";
import { getLearnIndexContent } from "@/lib/site-content";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LearnIndex } from "@/components/learn/LearnIndex";
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
    <SiteLayout activeNav="learn" learnDesign>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(courseLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <LearnIndex sections={getTutorialSections()} levels={LEARN_LEVELS} heroDescription={content.heroDescription || DESCRIPTION} originalEyebrow={content.heroEyebrow} originalTitle={content.heroTitle || content.title} tags={content.tags} whyTitle={content.whyTitle} whyBody={content.whyBody} />
    </SiteLayout>
  );
}
