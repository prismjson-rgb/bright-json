import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { getHomeContent } from "@/lib/site-content";
import { getAllTools } from "@/lib/tool-content";
import { getTutorialSections } from "@/lib/learn-content";

export function HomePageSEOContent() {
  const home = getHomeContent();
  const tools = getAllTools();
  const allLearnSections = getTutorialSections();
  const learnSections = allLearnSections.slice(0, 6);
  const totalLearn = allLearnSections.length;

  return (
    <div className="bg-[linear-gradient(180deg,_#07111b_0%,_#0b1320_100%)] text-white">
      <h1 className="sr-only">JSON Prism — Free JSON Formatter, Validator &amp; Workspace</h1>
      {/* Tool grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-8 sm:mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              All tools
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
              {tools.length} JSON tools in one workspace
            </h2>
          </div>
          <Link href="/tools/" className="hidden shrink-0 text-sm font-medium text-cyan-200 md:inline-flex items-center gap-1 hover:text-white transition-colors">
            Browse tool pages <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}/`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                {tool.badge || tool.category || "Tool"}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-cyan-100 transition-colors">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{tool.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* About / markdown content */}
      {home.contentMarkdown && (
        <section className="border-y border-white/10 bg-slate-950/40">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 sm:p-10">
              <MarkdownArticleBody content={home.contentMarkdown} />
            </div>
          </div>
        </section>
      )}

      {/* Learn articles */}
      {learnSections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <div className="mb-8 sm:mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                JSON tutorials
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
                Learn JSON from basics to advanced
              </h2>
            </div>
            <Link href="/learn/" className="hidden shrink-0 text-sm font-medium text-cyan-200 md:inline-flex items-center gap-1 hover:text-white transition-colors">
              All {totalLearn} tutorials <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {learnSections.map((section) => (
              <Link
                key={section.id}
                href={`/learn/${section.id}/`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/[0.05] group"
              >
                <h3 className="text-base font-semibold text-white group-hover:text-cyan-100 transition-colors">
                  {section.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-2">
                  {section.metaDescription || section.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {home.faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Frequently asked questions
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Common questions about JSON Prism</h2>
            <div className="mt-8 space-y-4">
              {home.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-white">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-400">
        <p className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/tools/" className="hover:text-cyan-200 transition-colors">Tools</Link>
          <span className="text-white/20">·</span>
          <Link href="/learn/" className="hover:text-cyan-200 transition-colors">Learn</Link>
          <span className="text-white/20">·</span>
          <Link href="/about/" className="hover:text-cyan-200 transition-colors">About</Link>
          <span className="text-white/20">·</span>
          <Link href="/privacy/" className="hover:text-cyan-200 transition-colors">Privacy</Link>
          <span className="text-white/20">·</span>
          <Link href="/terms/" className="hover:text-cyan-200 transition-colors">Terms</Link>
        </p>
        <p className="mt-3 text-xs text-slate-400">No data stored. Runs entirely in your browser.</p>
      </footer>
    </div>
  );
}
