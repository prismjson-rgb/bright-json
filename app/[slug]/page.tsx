import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug, getAllPageSlugs } from "@/lib/pages-content";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://bright-json.vercel.app";

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

  const title = page.metaTitle || `${page.title} | JSON Prism`;
  const description = page.metaDescription || "";

  return {
    title: `${title} | JSON Prism`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "JSON Prism",
      url: `${BASE}/${slug}/`,
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

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface1 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold">JSON Prism</span>
          </Link>
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-8">
            {page.title}
          </h1>
          <MarkdownArticleBody content={page.contentMarkdown} />
        </article>
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>
          Part of{" "}
          <Link href="/" className="text-primary hover:underline">
            JSON Prism
          </Link>
        </p>
      </footer>
    </div>
  );
}
