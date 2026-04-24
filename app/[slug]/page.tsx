import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getAllPageSlugs } from "@/lib/pages-content";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { SiteLayout } from "@/components/site/SiteLayout";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export function generateStaticParams() {
  return getAllPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) return { title: "Not Found" };

  const title = page.metaTitle || page.title;
  const description = page.metaDescription || "";

  return {
    title: `${title} | JSON Prism`,
    description,
    openGraph: {
      title: `${title} | JSON Prism`,
      description,
      type: "website",
      siteName: "JSON Prism",
      url: `${BASE}/${slug}/`,
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | JSON Prism`,
      description,
      images: [`${BASE}/og-image.png`],
    },
    alternates: { canonical: `${BASE}/${slug}/` },
  };
}

export default async function StaticPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) notFound();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: page.title, item: `${BASE}/${slug}/` },
    ],
  };

  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
        <article className="max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mb-8 sm:mb-10">
            {page.title}
          </h1>
          <MarkdownArticleBody content={page.contentMarkdown} />
        </article>
      </main>
    </SiteLayout>
  );
}
