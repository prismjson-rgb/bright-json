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
    <span className="inline-flex items-center rounded-sm border border-border bg-surface2 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-primary">
      {children}
    </span>
  );
}

const CORE_WORKFLOWS = [
  {
    title: "Format JSON online",
    body: "Beautify minified API responses, normalize indentation, and make nested data easier to review.",
    href: "/tools/json-formatter/",
    icon: Braces,
  },
  {
    title: "Validate JSON syntax",
    body: "Catch missing commas, broken strings, trailing commas, and invalid values before they reach an API.",
    href: "/tools/json-validator/",
    icon: CheckCircle2,
  },
  {
    title: "Edit JSON safely",
    body: "Use the visual JSON editor to update fields, booleans, arrays, and objects without hand-editing syntax.",
    href: "/tools/json-visual-editor/",
    icon: PencilLine,
  },
  {
    title: "Compare JSON files",
    body: "Diff two payloads structurally so value changes stand out without noise from whitespace.",
    href: "/tools/json-diff-viewer/",
    icon: GitCompare,
  },
  {
    title: "Convert JSON formats",
    body: "Turn JSON into CSV, YAML, XML, or other working formats from the same browser workspace.",
    href: "/tools/json-converter/",
    icon: FileJson,
  },
  {
    title: "Debug malformed JSON",
    body: "Get clearer explanations for parser failures, invisible characters, LLM output, and rough pasted data.",
    href: "/tools/json-debugger/",
    icon: Sparkles,
  },
];

export function HomePageSEOContent() {
  const home = getHomeContent();
  const tools = getAllTools();
  const allLearnSections = getTutorialSections();
  const learnSections = allLearnSections.slice(0, 6);
  const totalLearn = allLearnSections.length;

  return (
    <div className="home-content border-t border-border bg-bg text-text1">
      {/* ── Overview ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <Eyebrow>{tools.length} JSON tools, one workspace</Eyebrow>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text1 sm:text-3xl">
                The free, all-in-one JSON toolkit - everything in one workspace.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-text2">
                JSON Prism is a free browser-based JSON toolkit for developers working with
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
                    className="rounded-sm border border-border bg-surface2 p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface2 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-4 text-sm font-semibold leading-6 text-text1">{point}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* ── Workflows ───────────────────────────────────────────────────── */}
      <section
        aria-label="Popular JSON workflows"
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
      >
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Popular workflows</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-text1 sm:text-3xl">
              The searches people come here for, ready to use.
            </h2>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
                className="group rounded-sm border border-border bg-surface2 p-5 transition-colors hover:border-primary/40"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface2 text-primary"
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-5 flex items-center gap-2 text-base font-semibold text-text1 group-hover:text-primary">
                  {workflow.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm leading-6 text-text3">{workflow.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* ── Tools section ──────────────────────────────────────────────── */}
      <section
        aria-label="All JSON tools"
        className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14"
      >
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>All tools</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-text1 sm:text-3xl">
              {tools.length} JSON tools,{" "}
              <span className="text-primary">
                one workspace
              </span>
            </h2>
          </div>
          <Link
            href="/tools/"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary transition-colors md:inline-flex"
          >
            Browse tool pages
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Editorial list - separator lines, no heavy card borders */}
        <div className="divide-y divide-border">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}/`}
              className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-start sm:gap-6 hover:bg-surface2 transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
            >
              <span
                className="shrink-0 w-24 pt-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-primary"
              >
                {tool.badge || tool.category || "Tool"}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text1 group-hover:text-primary transition-colors inline-flex items-center gap-2">
                  {tool.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="mt-1 text-sm leading-6 text-text2">{tool.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-8 md:hidden">
          <Link
            href="/tools/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary transition-colors"
          >
            Browse all tool pages
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* ── Learn section ───────────────────────────────────────────────── */}
      {learnSections.length > 0 && (
        <>
          <section
            aria-label="JSON tutorials"
            className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14"
          >
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <Eyebrow>Learn JSON</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-text1 sm:text-3xl">
                  From basics to{" "}
                  <span className="text-primary">
                    advanced
                  </span>
                </h2>
              </div>
              <Link
                href="/learn/"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary transition-colors md:inline-flex"
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
                  className="group rounded-sm border border-border bg-surface2 p-5 hover:border-primary/40 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-text1 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  {(section.metaDescription || section.excerpt) && (
                    <p className="mt-2 text-xs leading-5 text-text3 line-clamp-2">
                      {section.metaDescription || section.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-8 md:hidden">
              <Link
                href="/learn/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary transition-colors"
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
          <div className="h-px bg-border" />
          <section
            aria-label="Frequently asked questions"
            className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14"
          >
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mb-10 mt-5 text-2xl font-semibold tracking-tight text-text1 sm:text-3xl">
              Common questions about{" "}
              <span className="text-primary">
                JSON Prism
              </span>
            </h2>

            <div className="divide-y divide-border">
              {home.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group py-5 [&[open]>summary]:text-primary"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-text1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    {faq.question}
                    <span className="shrink-0 text-text3 group-open:text-primary transition-colors text-sm">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-text2 pr-8">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Privacy trust strip ─────────────────────────────────────────── */}
      <div className="h-px bg-border" />
      <section
        aria-label="Privacy"
        className="mx-auto max-w-3xl px-4 sm:px-6 py-12 text-center"
      >
        <p className="text-sm font-semibold text-text2 mb-2">Privacy by design</p>
        <p className="text-sm text-text3 leading-7 max-w-xl mx-auto">
          Every operation runs locally in your browser. No JSON is uploaded or stored by default.
          Short links are strictly opt-in and expire after 30 days.
        </p>
      </section>

      {/* ── Footer nav ──────────────────────────────────────────────────── */}
      <div className="h-px bg-border" />
      <footer className="py-10 text-center text-sm">
        <nav
          aria-label="Site links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-text3"
        >
          <Link href="/learn/" className="text-primary hover:text-primary transition-colors font-medium">
            JSON Tutorial
          </Link>
          <Link href="/tools/" className="hover:text-text2 transition-colors">Tools</Link>
          <Link href="/about/" className="hover:text-text2 transition-colors">About</Link>
          <Link href="/privacy/" className="hover:text-text2 transition-colors">Privacy Policy</Link>
          <Link href="/terms/" className="hover:text-text2 transition-colors">Terms</Link>
        </nav>
        <p className="mt-4 text-xs text-text3">
          © {new Date().getFullYear()} JSON Prism · Runs entirely in your browser
        </p>
      </footer>
    </div>
  );
}
