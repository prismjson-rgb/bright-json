import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolLandingPage } from "@/components/site/ToolLandingPage";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-content";
import { getToolFaqs } from "@/lib/tool-faqs";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return { title: "Not Found" };
  }

  const title = tool.metaTitle || `${tool.title} | JSON Prism`;

  return {
    title,
    description: tool.metaDescription || tool.summary,
    alternates: {
      canonical: `${BASE}/tools/${slug}/`,
    },
    openGraph: {
      title,
      description: tool.metaDescription || tool.summary,
      type: "article",
      url: `${BASE}/tools/${slug}/`,
      siteName: "JSON Prism",
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.metaDescription || tool.summary,
      images: [`${BASE}/og-image.png`],
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const faqs = getToolFaqs(tool);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${BASE}/tools/` },
      { "@type": "ListItem", position: 3, name: tool.title, item: `${BASE}/tools/${slug}/` },
    ],
  };

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: tool.title,
    description: tool.metaDescription || tool.summary,
    url: `${BASE}/tools/${slug}/`,
    isPartOf: { "@type": "WebPage", "@id": `${BASE}/tools/` },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />
      <ToolLandingPage tool={tool} faqs={faqs} />
    </>
  );
}
