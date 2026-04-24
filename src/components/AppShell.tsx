"use client";

import dynamic from "next/dynamic";

const JsonViewerClient = dynamic(
  () => import("@/components/JsonViewerClient"),
  { ssr: false, loading: () => null }
);

export default function AppShell() {
  return <JsonViewerClient />;
}
