import type { Metadata } from "next";
import BundleViewerWrapper from "@/components/BundleViewerWrapper";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export const metadata: Metadata = {
  title: "JSON Bundle Viewer — JSON Prism",
  description:
    "View and explore a shared JSON bundle. All data is decoded and rendered entirely in your browser — nothing is stored or transmitted.",
  alternates: { canonical: `${BASE}/bundle/` },
  openGraph: {
    title: "JSON Bundle Viewer — JSON Prism",
    description:
      "View and explore a shared JSON bundle. All data is decoded and rendered entirely in your browser — nothing is stored or transmitted.",
    type: "website",
    siteName: "JSON Prism",
    url: `${BASE}/bundle/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Bundle Viewer — JSON Prism",
    description:
      "View and explore a shared JSON bundle. Runs entirely in your browser.",
  },
};

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Bundle Viewer", item: `${BASE}/bundle/` },
  ],
};

export default function BundlePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <BundleViewerWrapper />
    </>
  );
}
