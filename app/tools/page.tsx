import type { Metadata } from "next";
import { ToolIndexPage } from "@/components/site/ToolIndexPage";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

const TITLE = "JSON Tools — Formatter, Validator, Diff & More | JSON Prism";
const DESCRIPTION =
  "Free online JSON tools: format, validate, diff, convert, and debug JSON in your browser. No install, no sign-up. 19 tools in one workspace.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${BASE}/tools/`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "JSON Prism",
    url: `${BASE}/tools/`,
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${BASE}/og-image.png`],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${BASE}/tools/` },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <ToolIndexPage />
    </>
  );
}
