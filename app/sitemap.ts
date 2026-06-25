import type { MetadataRoute } from "next";
import { getTutorialSections } from "@/lib/learn-content";
import { getAllPageSlugs } from "@/lib/pages-content";
import { getAllToolSlugs } from "@/lib/tool-content";

export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

// Stable site-wide fallback. Bump this only when page structure/copy
// meaningfully changes. Avoid `new Date()` here: a lastmod that moves on
// every build trains crawlers to ignore the signal.
const SITE_LASTMOD = "2026-06-25";

function toDate(value?: string | null): string {
  return value || SITE_LASTMOD;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const learnArticles = getTutorialSections().map((s) => ({
    url: BASE + "/learn/" + s.id + "/",
    lastModified: toDate(s.updatedAt || s.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const staticPages = getAllPageSlugs().map((slug) => ({
    url: BASE + "/" + slug + "/",
    lastModified: SITE_LASTMOD,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const toolPages = getAllToolSlugs().map((slug) => ({
    url: BASE + "/tools/" + slug + "/",
    lastModified: SITE_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE + "/", lastModified: SITE_LASTMOD, changeFrequency: "weekly", priority: 1 },
    { url: BASE + "/tools/", lastModified: SITE_LASTMOD, changeFrequency: "weekly", priority: 0.9 },
    { url: BASE + "/learn/", lastModified: SITE_LASTMOD, changeFrequency: "monthly", priority: 0.9 },
    ...learnArticles,
    { url: BASE + "/bundle/", lastModified: SITE_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    ...toolPages,
    ...staticPages,
  ];
}
