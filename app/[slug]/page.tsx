import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getPageBySlug, getAllPageSlugs } from "@/lib/pages-content";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { SiteLayout } from "@/components/site/SiteLayout";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

const PAGE_PRESENTATION = {
  about: {
    eyebrow: "About the project",
    lead: "A focused workspace for the JSON tasks developers handle every day.",
  },
  privacy: {
    eyebrow: "Privacy by design",
    lead: "Your workspace stays on your device unless you choose a network feature.",
  },
  terms: {
    eyebrow: "Plain-language terms",
    lead: "The ground rules for using a free, browser-based JSON workspace.",
  },
} as const;

const PAGE_LINKS = [
  { slug: "about", label: "About JSON Prism" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms & Conditions" },
] as const;

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
  const presentation = PAGE_PRESENTATION[slug as keyof typeof PAGE_PRESENTATION] ?? PAGE_PRESENTATION.about;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: page.title, item: `${BASE}/${slug}/` },
    ],
  };

  return (
    <SiteLayout contentDesign activeNav="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <div className="learn-article-shell company-guide">
        <div className="learn-article-grid">
          <article className="learn-article">
            <nav aria-label="Breadcrumb" className="learn-breadcrumb"><Link href="/">Home</Link><ChevronRight size={12} aria-hidden /><span>{page.title}</span></nav>
            <p className="learn-eyebrow">{presentation.eyebrow}</p>
            <h1>{page.title}</h1>
            <p className="company-guide-lead">{presentation.lead}</p>
            <div className="learn-article-content"><MarkdownArticleBody content={page.contentMarkdown} variant="learn" /></div>
          </article>
          <aside className="learn-article-sidebar">
            <nav className="learn-side-card" aria-label="Company pages">
              <h2>About JSON Prism</h2>
              {PAGE_LINKS.map(item => <Link key={item.slug} href={`/${item.slug}/`} aria-current={item.slug === slug ? "page" : undefined}>{item.label}</Link>)}
            </nav>
            <div className="learn-side-card company-guide-note"><h2>Local-first by default</h2><p>Format, inspect, and edit JSON directly in your browser.</p></div>
            <div className="learn-side-card learn-side-cta"><h2>Your JSON workspace</h2><p>Open the full workspace. No account or installation required.</p><Link href="/">Open JSON Prism →</Link></div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
