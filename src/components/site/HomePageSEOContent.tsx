import Link from "next/link";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Code2,
  FileJson,
  GitCompare,
  Lock,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getHomeContent } from "@/lib/site-content";
import { getAllTools } from "@/lib/tool-content";
import { getTutorialSections } from "@/lib/learn-content";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Category colour accents (maps badge/category → colour class)
// ---------------------------------------------------------------------------
const CATEGORY_COLORS: Record<string, string> = {
  Formatting: "text-cyan-400",
  Validation: "text-emerald-400",
  Comparison: "text-violet-400",
  Exploration: "text-amber-400",
  Conversion: "text-pink-400",
  Debugging: "text-red-400",
  Generation: "text-blue-400",
  Sharing: "text-teal-400",
  Editing: "text-orange-400",
};

function categoryColor(badge?: string | null): string {
  return CATEGORY_COLORS[badge ?? ""] ?? "text-slate-400";
}

const CORE_WORKFLOWS = [
  {
    title: "Format JSON online",
    body: "Beautify minified API responses, normalize indentation, and make nested data easier to review.",
    href: "/tools/json-formatter/",
    icon: Braces,
    accent: "text-cyan-300",
    bg: "bg-cyan-300/10",
    border: "border-cyan-300/20",
  },
  {
    title: "Validate JSON syntax",
    body: "Catch missing commas, broken strings, trailing commas, and invalid values before they reach an API.",
    href: "/tools/json-validator/",
    icon: CheckCircle2,
    accent: "text-emerald-300",
    bg: "bg-emerald-300/10",
    border: "border-emerald-300/20",
  },
  {
    title: "Edit JSON safely",
    body: "Use the visual JSON editor to update fields, booleans, arrays, and objects without hand-editing syntax.",
    href: "/tools/json-visual-editor/",
    icon: PencilLine,
    accent: "text-amber-300",
    bg: "bg-amber-300/10",
    border: "border-amber-300/20",
  },
  {
    title: "Compare JSON files",
    body: "Diff two payloads structurally so value changes stand out without noise from whitespace.",
    href: "/tools/json-diff-viewer/",
    icon: GitCompare,
    accent: "text-violet-300",
    bg: "bg-violet-300/10",
    border: "border-violet-300/20",
  },
  {
    title: "Convert JSON formats",
    body: "Turn JSON into CSV, YAML, XML, or other working formats from the same browser workspace.",
    href: "/tools/json-converter/",
    icon: FileJson,
    accent: "text-pink-300",
    bg: "bg-pink-300/10",
    border: "border-pink-300/20",
  },
  {
    title: "Debug malformed JSON",
    body: "Get clearer explanations for parser failures, invisible characters, LLM output, and rough pasted data.",
    href: "/tools/json-debugger/",
    icon: Sparkles,
    accent: "text-rose-300",
    bg: "bg-rose-300/10",
    border: "border-rose-300/20",
  },
];

export function HomePageSEOContent() {
  const home = getHomeContent();
  const tools = getAllTools();
  const allLearnSections = getTutorialSections();
  const learnSections = allLearnSections.slice(0, 6);
  const totalLearn = allLearnSections.length;

  return (
    <div className="bg-[linear-gradient(180deg,_#07111b_0%,_#0b1320_100%)] text-white">
      <h1 className="sr-only">JSON Editor Online - Free JSON Formatter, Validator &amp; Diff Tool</h1>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(34,211,238,0.08),transparent_72%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <Eyebrow>JSON editor online</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Format, validate, edit, and compare JSON in one private workspace.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-400">
                JSON Prism is a free browser-based JSON editor for developers working with
                API responses, configs, test fixtures, and generated payloads. Paste JSON once,
                then move between formatter, validator, visual editor, tree view, diff, converter,
                debugger, and sharing tools without opening another tab.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {home.trustPoints.map((point, index) => {
                const icons = [Lock, ShieldCheck, Code2];
                const Icon = icons[index] ?? ShieldCheck;
                return (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-4 text-sm font-semibold leading-6 text-white">{point}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── Workflows ───────────────────────────────────────────────────── */}
      <section
        aria-label="Popular JSON workflows"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Popular workflows</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The searches people come here for, ready to use.
            </h2>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
          >
            Open editor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_WORKFLOWS.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <Link
                key={workflow.title}
                href={workflow.href}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all hover:border-white/[0.16] hover:bg-white/[0.045]"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${workflow.border} ${workflow.bg} ${workflow.accent}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-5 flex items-center gap-2 text-base font-semibold text-white group-hover:text-cyan-100">
                  {workflow.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{workflow.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── Tools section ──────────────────────────────────────────────── */}
      <section
        aria-label="All JSON tools"
        className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20"
      >
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>All tools</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {tools.length} JSON tools,{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                one workspace
              </span>
            </h2>
          </div>
          <Link
            href="/tools/"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors md:inline-flex"
          >
            Browse tool pages
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Editorial list — separator lines, no heavy card borders */}
        <div className="divide-y divide-white/[0.06]">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}/`}
              className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-start sm:gap-6 hover:bg-white/[0.02] transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
            >
              <span
                className={`shrink-0 w-24 pt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${categoryColor(tool.badge)} opacity-70 group-hover:opacity-100 transition-opacity`}
              >
                {tool.badge || tool.category || "Tool"}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white group-hover:text-cyan-100 transition-colors inline-flex items-center gap-2">
                  {tool.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">{tool.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-8 md:hidden">
          <Link
            href="/tools/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Browse all tool pages
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── Learn section ───────────────────────────────────────────────── */}
      {learnSections.length > 0 && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <section
            aria-label="JSON tutorials"
            className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20"
          >
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <Eyebrow>Learn JSON</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  From basics to{" "}
                  <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    advanced
                  </span>
                </h2>
              </div>
              <Link
                href="/learn/"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors md:inline-flex"
              >
                All {totalLearn} tutorials
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {learnSections.map((section) => (
                <Link
                  key={section.id}
                  href={`/learn/${section.id}/`}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.03] transition-all"
                >
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-100 transition-colors">
                    {section.title}
                  </h3>
                  {(section.metaDescription || section.excerpt) && (
                    <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-2">
                      {section.metaDescription || section.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-8 md:hidden">
              <Link
                href="/learn/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                All {totalLearn} tutorials
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      {home.faqs.length > 0 && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <section
            aria-label="Frequently asked questions"
            className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20"
          >
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mb-10 mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Common questions about{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                JSON Prism
              </span>
            </h2>

            <div className="divide-y divide-white/[0.07]">
              {home.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group py-5 [&[open]>summary]:text-cyan-200"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-white transition-colors hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 rounded">
                    {faq.question}
                    <span className="shrink-0 text-slate-500 group-open:text-cyan-400 transition-colors text-sm">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-400 pr-8">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Privacy trust strip ─────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <section
        aria-label="Privacy"
        className="mx-auto max-w-3xl px-4 sm:px-6 py-12 text-center"
      >
        <p className="text-sm font-semibold text-slate-300 mb-2">Privacy by design</p>
        <p className="text-sm text-slate-500 leading-7 max-w-xl mx-auto">
          Every operation runs locally in your browser. No JSON is uploaded or stored by default.
          Short links are strictly opt-in and expire after 30 days.
        </p>
      </section>

      {/* ── Footer nav ──────────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <footer className="py-10 text-center text-sm">
        <nav
          aria-label="Site links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500"
        >
          <Link href="/learn/" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            JSON Tutorial
          </Link>
          <Link href="/tools/" className="hover:text-slate-300 transition-colors">Tools</Link>
          <Link href="/about/" className="hover:text-slate-300 transition-colors">About</Link>
          <Link href="/privacy/" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms/" className="hover:text-slate-300 transition-colors">Terms</Link>
        </nav>
        <p className="mt-4 text-xs text-slate-600">
          © {new Date().getFullYear()} JSON Prism · Runs entirely in your browser
        </p>
      </footer>
    </div>
  );
}
