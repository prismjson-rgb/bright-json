import { notFound } from "next/navigation";
import {
  getTutorialSections,
  getSectionById,
  LEARN_LEVELS,
} from "@/lib/learn-content";
import { LearnArticlePage } from "@/components/LearnArticlePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getTutorialSections().map((s) => ({ slug: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSectionById(slug);
  if (!section) return { title: "Not Found" };

  const title = section.metaTitle || section.title;
  const description =
    section.metaDescription ||
    `Learn about ${section.title} in this JSON tutorial. Part of the complete JSON guide from JSON Prism.`;

  return buildMetadata({
    title: `${title} | JSON Prism`,
    description,
    path: `/learn/${slug}/`,
    type: "article",
    keywords: section.keyTerms ?? [],
    ogTitle: title,
    twitterTitle: title,
  });
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
  const path = `/learn/${slug}/`;

  const jsonLd = articleJsonLd({
    title: section.title,
    description: section.metaDescription || section.contentMarkdown.slice(0, 160),
    path,
    datePublished: section.publishedAt || "2025-12-01",
    dateModified: section.updatedAt || section.publishedAt || "2025-12-01",
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn/" },
    { name: section.title, path },
  ]);

  return (
    <SiteLayout activeNav="learn" learnDesign>
      <JsonLdScripts data={[jsonLd, breadcrumbLd]} />

      <div className="learn-article-shell">
        <LearnArticlePage
          section={section}
          levelLabel={levelInfo?.label}
          sections={allSections}
          prev={prev ? { id: prev.id, title: prev.title } : undefined}
          next={next ? { id: next.id, title: next.title } : undefined}
        />
      </div>
    </SiteLayout>
  );
}
