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

export default function BundlePage() {
  return <BundleViewerWrapper />;
}
