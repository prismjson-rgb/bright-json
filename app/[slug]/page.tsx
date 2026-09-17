import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { getPageBySlug, getAllPageSlugs } from "@/lib/pages-content";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { SiteLayout } from "@/components/site/SiteLayout";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

const PAGE_PRESENTATION = {
  about: {
    eyebrow: "About the project",
    lead: "A focused workspace for the JSON tasks developers handle every day.",
    icon: Sparkles,
    accent: "text-cyan-300",
    iconSurface: "border-cyan-300/20 bg-cyan-300/10",
  },
  privacy: {
    eyebrow: "Privacy by design",
    lead: "Your workspace stays on your device unless you choose a network feature.",
    icon: LockKeyhole,
    accent: "text-emerald-300",
    iconSurface: "border-emerald-300/20 bg-emerald-300/10",
  },
  terms: {
    eyebrow: "Plain-language terms",
    lead: "The ground rules for using a free, browser-based JSON workspace.",
    icon: FileText,
    accent: "text-violet-300",
    iconSurface: "border-violet-300/20 bg-violet-300/10",
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
  const PresentationIcon = presentation.icon;

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

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(34,211,238,0.09),transparent_72%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-1.5 text-xs text-slate-600">
            <Link href="/" className="transition-colors hover:text-slate-300">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-slate-400">{page.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div className="max-w-3xl">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${presentation.iconSurface} ${presentation.accent}`}>
                <PresentationIcon className="h-5 w-5" aria-hidden />
              </div>
              <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] ${presentation.accent}`}>
                {presentation.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                {presentation.lead}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-300">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Local-first by default</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Format, inspect, and edit JSON directly in your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-16">
        <article className="min-w-0">
          <MarkdownArticleBody content={page.contentMarkdown} variant="landing" />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <nav aria-label="Company pages" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
            <p className="border-b border-white/[0.07] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              JSON Prism
            </p>
            <div className="p-2">
              {PAGE_LINKS.map((item) => {
                const isActive = item.slug === slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}/`}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-cyan-300/10 font-semibold text-cyan-200"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {item.label}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
            <p className="text-sm font-semibold text-white">Ready to work with JSON?</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Open the full workspace. No account or installation required.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cyan-200 transition-colors hover:text-cyan-100"
            >
              Open JSON Prism
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </aside>
      </main>
    </SiteLayout>
  );
}
