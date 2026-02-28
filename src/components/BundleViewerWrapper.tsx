"use client";
import dynamic from "next/dynamic";

const BundleViewer = dynamic(() => import("@/components/BundleViewer"), { ssr: false });

export default function BundleViewerWrapper() {
  return <BundleViewer />;
}
