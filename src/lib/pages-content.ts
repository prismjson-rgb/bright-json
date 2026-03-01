/**
 * Static pages — from content/pages/*.md (generated at build)
 */

import {
  PAGES,
  PAGE_SLUGS,
  type PageContent,
} from "./pages-content.generated";

export type { PageContent };

export function getPageBySlug(slug: string): PageContent | undefined {
  return PAGES.find((p) => p.slug === slug);
}

export function getAllPageSlugs(): string[] {
  return PAGE_SLUGS;
}
