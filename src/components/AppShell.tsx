"use client";

import dynamic from "next/dynamic";

function AppShellFallback() {
  return (
    <div className="flex h-screen flex-col bg-bg" aria-hidden="true">
      <div className="hidden h-12 shrink-0 border-b border-border bg-toolbar md:block" />
      <div className="flex min-h-0 flex-1 bg-grad-hero bg-bg">
        <div className="hidden w-64 shrink-0 border-r border-border bg-surface1 md:block" />
        <main className="flex min-w-0 flex-1 flex-col md:flex-row">
          <section className="flex min-h-[70vh] min-w-0 shrink-0 flex-col border-r border-border bg-surface1 md:min-h-0 md:flex-1">
            <div className="h-10 shrink-0 border-b border-border bg-toolbar" />
            <div className="h-10 shrink-0 border-b border-border bg-pane-header" />
            <div className="min-h-0 flex-1" />
          </section>
          <section className="flex min-h-[60vh] min-w-0 shrink-0 flex-col bg-surface2 md:min-h-0 md:flex-1">
            <div className="h-10 shrink-0 border-b border-border bg-pane-header" />
            <div className="min-h-0 flex-1" />
          </section>
        </main>
      </div>
      <div className="h-7 shrink-0 border-t border-border bg-toolbar" />
    </div>
  );
}

const JsonViewerClient = dynamic(
  () => import("@/components/JsonViewerClient"),
  { ssr: false, loading: AppShellFallback }
);

export default function AppShell() {
  return <JsonViewerClient />;
}
