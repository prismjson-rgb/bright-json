import type { MetadataRoute } from "next";
import { getTutorialSections } from "@/lib/learn-content";
import { getAllPageSlugs } from "@/lib/pages-content";
import { getAllToolSlugs } from "@/lib/tool-content";

export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const learnArticles = getTutorialSections().map((s) => ({
    url: BASE + "/learn/" + s.id + "/",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const staticPages = getAllPageSlugs().map((slug) => ({
    url: BASE + "/" + slug + "/",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const toolPages = getAllToolSlugs().map((slug) => ({
    url: BASE + "/tools/" + slug + "/",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE + "/", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: BASE + "/tools/", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: BASE + "/learn/", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...learnArticles,
    { url: BASE + "/bundle/", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...toolPages,
    ...staticPages,
  ];
}
