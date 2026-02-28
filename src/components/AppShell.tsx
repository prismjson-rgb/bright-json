"use client";
import dynamic from "next/dynamic";

const JsonViewerClient = dynamic(
  () => import("@/components/JsonViewerClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground font-mono text-sm">
        Loading…
      </div>
    ),
  }
);

export default function AppShell() {
  return <JsonViewerClient />;
}
