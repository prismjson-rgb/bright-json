import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import type { ToolContent } from "@/lib/tool-content";
import type { ToolFaq } from "@/lib/tool-faqs";

function ToolPreview({ title, appHref }: { title: string; appHref?: string }) {
  return (
    <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/70 p-5">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Deep link
          </span>
          <span className="text-xs text-slate-400">{appHref}</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-5">
          <p className="text-sm font-semibold text-white">{title}</p>
          <div className="mt-4 space-y-3">
            <div className="h-2 rounded-full bg-cyan-300/70" />
            <div className="h-2 w-4/5 rounded-full bg-white/20" />
            <div className="h-2 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolLandingPage({ tool, faqs }: { tool: ToolContent; faqs: ToolFaq[] }) {
  return (
    <SiteLayout activeNav="tools">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              {tool.badge || tool.category || "Tool page"}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
              {tool.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {tool.summary || tool.metaDescription}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={(tool.appHref || "/").replace(/^\/app\//, "/")}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Launch this workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tools/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white"
              >
                Browse all tools
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {tool.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300"
                >
                  <CheckCircle2 className="mb-3 h-4 w-4 text-cyan-200" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <ToolPreview title={tool.title} appHref={tool.appHref} />
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <MarkdownArticleBody content={tool.contentMarkdown} />
          </div>
          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Best for
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {tool.useCases.map((useCase) => (
                  <li key={useCase} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Search targets
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Tool Q&A
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            Questions people ask before opening {tool.title}
          </h2>
          <div className="mt-8">
            <FaqAccordion faqs={faqs} />
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
