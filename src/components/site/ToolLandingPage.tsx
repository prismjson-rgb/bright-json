import Link from "next/link";
import { ArrowRight, ChevronRight, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import type { ToolContent } from "@/lib/tool-content";
import type { ToolFaq } from "@/lib/tool-faqs";

// ---------------------------------------------------------------------------
// Shared typography primitives
// ---------------------------------------------------------------------------

/** Pill-style eyebrow label */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
      {children}
    </span>
  );
}

/** Large display heading — first part white, last word(s) in cyan gradient */
function DisplayHeading({
  prefix,
  accent,
  tag: Tag = "h1",
  className = "",
}: {
  prefix: string;
  accent?: string;
  tag?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag
      className={`font-bold tracking-tighter text-white leading-[1.06] ${className}`}
    >
      {prefix}
      {accent && (
        <>
          {" "}
          <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
            {accent}
          </span>
        </>
      )}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Tool-specific code preview snippets
// ---------------------------------------------------------------------------
const TOOL_PREVIEW_CONTENT: Record<string, React.ReactNode> = {
  "json-formatter": (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Before</p>
        <code className="break-all text-[12px] leading-5 text-slate-400">
          {`{"user":{"id":1042,"name":"Dana","roles":["admin","editor"],"active":true}}`}
        </code>
      </div>
      <div className="h-px bg-white/[0.06]" />
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">After</p>
        <pre className="text-[12px] leading-[1.6]">
          <span className="text-slate-300">{"{\n"}</span>
          <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;user&quot;</span><span className="text-slate-400">{": {\n"}</span>
          <span className="text-slate-300">{"    "}</span><span className="text-cyan-300">&quot;id&quot;</span><span className="text-slate-400">{": "}</span><span className="text-amber-300">1042</span><span className="text-slate-400">{",\n"}</span>
          <span className="text-slate-300">{"    "}</span><span className="text-cyan-300">&quot;name&quot;</span><span className="text-slate-400">{": "}</span><span className="text-emerald-300">&quot;Dana&quot;</span><span className="text-slate-400">{",\n"}</span>
          <span className="text-slate-300">{"    "}</span><span className="text-cyan-300">&quot;active&quot;</span><span className="text-slate-400">{": "}</span><span className="text-violet-300">true</span><span className="text-slate-300">{"\n  }\n}"}</span>
        </pre>
      </div>
    </div>
  ),
  "json-validator": (
    <div className="space-y-3">
      <pre className="text-[12px] leading-[1.6]">
        <span className="text-slate-300">{"{\n"}</span>
        <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;name&quot;</span><span className="text-slate-400">{": "}</span><span className="text-emerald-300">&quot;Alice&quot;</span><span className="text-slate-400">{",\n"}</span>
        <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;age&quot;</span><span className="text-slate-400">{": "}</span><span className="text-amber-300">30</span><span className="text-slate-400">{",\n"}</span>
        <span className="rounded bg-red-500/20 px-1"><span className="text-red-300">&quot;active&quot;</span><span className="text-slate-400">{": "}</span><span className="text-violet-300">true</span><span className="text-red-400">,</span></span>
        <span className="text-slate-500">{" ← trailing comma\n"}</span>
        <span className="text-slate-300">{"}"}</span>
      </pre>
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
        <p className="font-mono text-[11px] text-red-400">✗ SyntaxError · line 4, col 18</p>
        <p className="mt-0.5 text-[11px] text-slate-400">Unexpected trailing comma</p>
      </div>
    </div>
  ),
  "json-diff-viewer": (
    <div className="space-y-0.5 font-mono text-[12px] leading-[1.7]">
      <div className="text-slate-400">{"{"}</div>
      <div className="rounded bg-red-500/15 pl-4"><span className="text-red-400">- &quot;version&quot;: &quot;1.0.0&quot;,</span></div>
      <div className="rounded bg-emerald-500/15 pl-4"><span className="text-emerald-400">+ &quot;version&quot;: &quot;1.0.1&quot;,</span></div>
      <div className="pl-4 text-slate-400">  &quot;stable&quot;: true,</div>
      <div className="rounded bg-red-500/15 pl-4"><span className="text-red-400">- &quot;debug&quot;: true,</span></div>
      <div className="rounded bg-emerald-500/15 pl-4"><span className="text-emerald-400">+ &quot;production&quot;: true,</span></div>
      <div className="text-slate-400">{"}"}</div>
      <div className="mt-3 flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm border border-emerald-500/50 bg-emerald-500/30" />2 added
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm border border-red-500/50 bg-red-500/30" />2 removed
        </span>
      </div>
    </div>
  ),
};

function DefaultPreviewCode() {
  return (
    <pre className="text-[12px] leading-[1.6]">
      <span className="text-slate-300">{"{\n"}</span>
      <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;id&quot;</span><span className="text-slate-400">{": "}</span><span className="text-amber-300">1042</span><span className="text-slate-400">{",\n"}</span>
      <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;name&quot;</span><span className="text-slate-400">{": "}</span><span className="text-emerald-300">&quot;Dana&quot;</span><span className="text-slate-400">{",\n"}</span>
      <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;roles&quot;</span><span className="text-slate-400">{": ["}</span><span className="text-emerald-300">&quot;admin&quot;</span><span className="text-slate-400">{", "}</span><span className="text-emerald-300">&quot;editor&quot;</span><span className="text-slate-400">{"],\n"}</span>
      <span className="text-slate-300">{"  "}</span><span className="text-cyan-300">&quot;active&quot;</span><span className="text-slate-400">{": "}</span><span className="text-violet-300">true</span><span className="text-slate-400">{"\n"}</span>
      <span className="text-slate-300">{"}"}</span>
    </pre>
  );
}

// ---------------------------------------------------------------------------
// macOS-style terminal preview window
// ---------------------------------------------------------------------------
function ToolPreview({ appHref, title }: { appHref?: string; title: string }) {
  const toolKey = appHref?.match(/tool=([^&]+)/)?.[1] ?? "";
  const content = TOOL_PREVIEW_CONTENT[toolKey] ?? <DefaultPreviewCode />;

  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-cyan-500/[0.04] rounded-3xl blur-3xl pointer-events-none" />
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b1624] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-90" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] opacity-90" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] opacity-90" />
          </div>
          <span className="truncate font-mono text-[11px] text-slate-500">{title} — JSON Prism</span>
        </div>
        <div className="min-h-[180px] p-5">{content}</div>
        <div className="flex items-center gap-3 border-t border-white/[0.06] bg-white/[0.01] px-4 py-2">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            JSON Prism
          </span>
          <span className="font-mono text-[10px] text-slate-600">·</span>
          <span className="font-mono text-[10px] text-slate-500">Browser-only · No uploads</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main landing page
// ---------------------------------------------------------------------------
export function ToolLandingPage({ tool, faqs }: { tool: ToolContent; faqs: ToolFaq[] }) {
  const appLink = (tool.appHref || "/").replace(/^\/app\//, "/");

  // Split title into first words + last word for gradient accent
  const words = tool.title.split(" ");
  const accentWord = words.slice(-1)[0];
  const prefixWords = words.slice(0, -1).join(" ");

  return (
    <SiteLayout activeNav="tools">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-5%,rgba(34,211,238,0.07),transparent)]"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16 pt-10 sm:pb-24 sm:pt-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-1.5 text-xs text-slate-600">
            <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/tools/" className="hover:text-slate-400 transition-colors">Tools</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-slate-400 truncate">{tool.title}</span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: text */}
            <div>
              <Eyebrow>{tool.badge || tool.category || "Tool"}</Eyebrow>

              <DisplayHeading
                prefix={prefixWords || tool.title}
                accent={prefixWords ? accentWord : undefined}
                tag="h1"
                className="mt-5 text-5xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem]"
              />

              <p className="mt-6 max-w-lg text-base leading-8 text-slate-400 sm:text-lg">
                {tool.summary || tool.metaDescription}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={appLink}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  Open {tool.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tools/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  All tools
                </Link>
              </div>

              {/* Highlights */}
              {tool.highlights.length > 0 && (
                <ul className="mt-10 space-y-3">
                  {tool.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm text-slate-400">
                      <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: code preview (desktop only) */}
            <div className="hidden lg:block">
              <ToolPreview appHref={tool.appHref} title={tool.title} />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── Article + Aside ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(45,212,191,0.09),transparent_72%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Practical guide
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Build, validate, and reuse JSON with less friction.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              A focused walkthrough for deciding when the tool fits your workflow.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <div className="min-w-0 rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-5 shadow-[0_35px_120px_-60px_rgba(34,211,238,0.35)] sm:p-8">
              <MarkdownArticleBody content={tool.contentMarkdown} variant="landing" />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06]">
                <div className="border-b border-cyan-300/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Start in seconds</p>
                      <p className="mt-0.5 text-xs text-slate-500">Private, free, browser-only</p>
                    </div>
                  </div>
                </div>

                <Link
                  href={appLink}
                  className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/10 hover:text-cyan-100"
                >
                  Open {tool.title}
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>

            {tool.useCases.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-cyan-300" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Best for
                  </p>
                </div>
                <ul className="space-y-3">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-2.5 text-sm leading-6 text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <RelatedLinks relatedTools={tool.relatedTools} relatedLearn={tool.relatedLearn} variant="dark" />

            {tool.keywords.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Related searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-xs text-slate-500"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/[0.08] bg-[#0a121e] p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Promise
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["No upload", "No account", "Instant output", "Editable JSON"].map((item) => (
                  <span
                    key={item}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="mb-10 text-center">
          <Eyebrow>FAQ</Eyebrow>
          <DisplayHeading
            prefix="Questions about"
            accent={tool.title}
            tag="h2"
            className="mt-5 text-3xl sm:text-4xl"
          />
          <p className="mt-4 text-sm text-slate-500">
            Everything you need to know before you start.
          </p>
        </div>
        <FaqAccordion faqs={faqs} />
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] px-6 py-14 text-center sm:py-16">
          <Eyebrow>Ready to use it?</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {tool.title},{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
              free &amp; private.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm text-slate-500">
            No account needed. Your JSON never leaves your browser.
          </p>
          <Link
            href={appLink}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-8 py-4 text-base font-semibold text-slate-950 transition-all hover:bg-cyan-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Launch {tool.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
