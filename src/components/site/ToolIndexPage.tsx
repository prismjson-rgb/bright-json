import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getAllTools } from "@/lib/tool-content";
import { getToolsIndexContent } from "@/lib/site-content";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
      {children}
    </span>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Formatting: "text-cyan-400 bg-cyan-400/10",
  Validation: "text-emerald-400 bg-emerald-400/10",
  Comparison: "text-violet-400 bg-violet-400/10",
  Exploration: "text-amber-400 bg-amber-400/10",
  Conversion: "text-pink-400 bg-pink-400/10",
  Debugging: "text-red-400 bg-red-400/10",
  Generation: "text-blue-400 bg-blue-400/10",
  Sharing: "text-teal-400 bg-teal-400/10",
  Editing: "text-orange-400 bg-orange-400/10",
};

function badgeClass(badge?: string | null): string {
  return CATEGORY_COLORS[badge ?? ""] ?? "text-slate-400 bg-slate-400/10";
}

export function ToolIndexPage() {
  const tools = getAllTools();
  const content = getToolsIndexContent();

  return (
    <SiteLayout activeNav="tools">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(34,211,238,0.08),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20">
          {content.heroEyebrow && <Eyebrow>{content.heroEyebrow}</Eyebrow>}
          <h1 className="mt-5 text-5xl font-bold tracking-tighter text-white sm:text-6xl lg:text-7xl leading-[1.04]">
            {content.heroTitle || content.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            {content.heroDescription}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Tool list */}
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20"
      >
        <div className="divide-y divide-white/[0.06]">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}/`}
              className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:gap-8 hover:bg-white/[0.02] transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
            >
              {/* Category badge */}
              <div className="shrink-0 sm:w-32 sm:pt-0.5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeClass(tool.badge)}`}
                >
                  {tool.badge || tool.category || "Tool"}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white group-hover:text-cyan-100 transition-colors inline-flex items-center gap-2 flex-wrap">
                  {tool.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">{tool.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
