import type { Metadata } from "next";

export const SITE_NAME = "JSON Prism";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
export const LOGO_URL = `${SITE_URL}/icons/icon-512.png`;

export function siteUrl(path = ""): string {
  return `${SITE_URL}${path}`;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  keywords?: string[];
  robots?: Metadata["robots"];
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  imageAlt?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  keywords,
  robots,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  imageAlt,
}: BuildMetadataInput): Metadata {
  const url = siteUrl(path);
  const resolvedImageAlt = imageAlt || ogTitle || title;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(robots ? { robots } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle || title,
      description: ogDescription || description,
      type,
      siteName: SITE_NAME,
      url,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: resolvedImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle || ogTitle || title,
      description: twitterDescription || ogDescription || description,
      images: [OG_IMAGE_URL],
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl("/"),
    logo: LOGO_URL,
  };
}

export function websiteJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl("/"),
    description,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl("/"),
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };
}

export function itemListJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JSON Prism tools",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
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
}

export function webPageJsonLd({
  name,
  description,
  path,
  isPartOfPath,
}: {
  name: string;
  description: string;
  path: string;
  isPartOfPath?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: siteUrl(path),
    ...(isPartOfPath
      ? { isPartOf: { "@type": "WebPage", "@id": siteUrl(isPartOfPath) } }
      : {}),
  };
}

export function softwareApplicationJsonLd({
  name,
  description,
  path,
  subCategory,
  features,
  imageUrl = OG_IMAGE_URL,
}: {
  name: string;
  description: string;
  path: string;
  subCategory?: string;
  features: string[];
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "DeveloperApplication",
    ...(subCategory ? { applicationSubCategory: subCategory } : {}),
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Runs in any modern browser.",
    url: siteUrl(path),
    description,
    image: imageUrl,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: features,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl("/"),
      logo: LOGO_URL,
    },
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  imageUrl = OG_IMAGE_URL,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl("/"),
      logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
    },
    image: { "@type": "ImageObject", url: imageUrl, width: 1200, height: 630 },
    url: siteUrl(path),
    datePublished,
    dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": siteUrl(path) },
  };
}

export function courseJsonLd({
  name,
  description,
  sections,
}: {
  name: string;
  description: string;
  sections: Array<{ id: string; title: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: { "@type": "Organization", name: SITE_NAME, url: siteUrl("/") },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT5H",
    },
    hasPart: sections.map((section) => ({
      "@type": "LearningResource",
      name: section.title,
      url: siteUrl(`/learn/${section.id}/`),
    })),
  };
}

