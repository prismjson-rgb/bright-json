import Link from "next/link";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getAllTools } from "@/lib/tool-content";
import { getToolsIndexContent } from "@/lib/site-content";

export function ToolIndexPage() {
  const tools = getAllTools();
  const content = getToolsIndexContent();

  return (
    <SiteLayout activeNav="tools">
      <main className="mx-auto max-w-7xl px-6 py-20">
        {content.heroEyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            {content.heroEyebrow}
          </p>
        )}
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          {content.heroTitle || content.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          {content.heroDescription}
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}/`}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                {tool.badge || tool.category || "Tool"}
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">{tool.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{tool.summary}</p>
            </Link>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
