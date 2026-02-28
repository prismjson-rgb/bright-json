import type { Metadata } from "next";
import BundleViewerWrapper from "@/components/BundleViewerWrapper";

export const metadata: Metadata = {
  title: "JSON Bundle · JSON Prism",
  description: "Browse a shared JSON bundle. No data stored — runs entirely in your browser.",
};

export default function BundlePage() {
  return <BundleViewerWrapper />;
}
