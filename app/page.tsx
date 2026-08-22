import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { HomePageSEOContent } from "@/components/site/HomePageSEOContent";
import { getHomeContent } from "@/lib/site-content";
import { getAllTools } from "@/lib/tool-content";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export const metadata: Metadata = {
  title: "JSON Prism | All-in-One JSON Toolkit — 19 Free Tools",
  description:
    "Format, validate, edit, diff, and convert JSON in one free browser-based workspace. 19 tools, no sign-up, nothing ever uploaded.",
  alternates: {
    canonical: `${BASE}/`,
  },
  openGraph: {
    title: "JSON Prism — The Free All-in-One JSON Toolkit",
    description:
      "Format, validate, edit, diff, and convert JSON in one free browser-based workspace. 19 tools, no sign-up, nothing ever uploaded.",
    type: "website",
    url: `${BASE}/`,
    siteName: "JSON Prism",
    images: [
      {
        url: `${BASE}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JSON Prism - JSON workspace in your browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Prism — The Free All-in-One JSON Toolkit",
    description:
      "Format, validate, edit, diff, and convert JSON in one free browser-based workspace. 19 tools, no sign-up, nothing ever uploaded.",
    images: [`${BASE}/og-image.png`],
  },
};

export default function HomePage() {
  const home = getHomeContent();
  const tools = getAllTools();

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JSON Prism",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${BASE}/`,
    description: home.metaDescription,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: tools.map((t) => t.title),
    image: `${BASE}/icons/icon-512.png`,
    publisher: {
      "@type": "Organization",
      name: "JSON Prism",
      logo: `${BASE}/icons/icon-512.png`,
      url: `${BASE}/`,
    },
  };

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JSON Prism",
    url: `${BASE}/`,
    logo: `${BASE}/icons/icon-512.png`,
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JSON Prism",
    url: `${BASE}/`,
    description: home.metaDescription,
    publisher: {
      "@type": "Organization",
      name: "JSON Prism",
      url: `${BASE}/`,
      logo: { "@type": "ImageObject", url: `${BASE}/icons/icon-512.png` },
    },
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JSON Prism tools",
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/tools/${t.slug}/`,
      name: t.title,
    })),
  };

  const faqLd = home.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: home.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
        />
      )}

      {/* App workspace - fills the viewport (h-screen) */}
      <AppShell />

      {/* SEO/AEO content - below the fold, visible on scroll */}
      <HomePageSEOContent />
    </>
  );
}
