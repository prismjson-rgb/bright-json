import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarkdownArticleBody } from "@/components/MarkdownArticleBody";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ContentBreadcrumb } from "@/components/site/ContentBreadcrumb";
import { Eyebrow } from "@/components/site/SitePrimitives";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { InlineJsonFormatter } from "@/components/site/InlineJsonFormatter";
import type { ToolContent } from "@/lib/tool-content";
import type { ToolFaq } from "@/lib/tool-faqs";

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

// Tools that get a real, working widget instead of the static code preview.
// Kept to a short allowlist deliberately - this is a heavier, more involved
// section, so it's opt-in per tool rather than default behavior.
const LIVE_WIDGET_TOOLS = new Set(["json-formatter"]);

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
          <span className="truncate font-mono text-[11px] text-slate-500">{title} - JSON Prism</span>
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
  const toolKey = tool.appHref?.match(/tool=([^&]+)/)?.[1] ?? "";
  const hasLiveWidget = LIVE_WIDGET_TOOLS.has(toolKey);

  return (
    <SiteLayout activeNav="tools" contentDesign>
      <div className="learn-index-inner tool-landing-hero">
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools/" },
            { label: tool.title },
          ]}
        />

        <div className={`learn-hero ${hasLiveWidget ? "tool-landing-hero-live" : ""}`}>
          <div className="learn-hero-copy">
            <Eyebrow>{tool.badge || tool.category || "Tool"}</Eyebrow>
            <h1>{tool.title}</h1>
            <p className="learn-hero-description">{tool.summary || tool.metaDescription}</p>

            <div className="learn-hero-actions">
              <Link href={appLink} className="learn-button-primary">
                Open {tool.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tools/" className="learn-button-outline">
                All tools
              </Link>
            </div>

            {tool.highlights.length > 0 && (
              <ul className="tool-landing-highlights">
                {tool.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </div>

          {hasLiveWidget ? (
            <InlineJsonFormatter appHref={tool.appHref ?? "/app/?tool=json-formatter"} title={tool.title} />
          ) : (
            <div className="tool-landing-preview hidden lg:block">
              <ToolPreview appHref={tool.appHref} title={tool.title} />
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--learn-border)]" />

      <div className="learn-article-shell tool-landing-guide">
        <div className="learn-article-grid">
          <article className="learn-article">
            <Eyebrow>Practical guide</Eyebrow>
            <h2>Build, validate, and reuse JSON with less friction.</h2>
            <p className="tool-landing-guide-lead">
              A focused walkthrough for deciding when the tool fits your workflow.
            </p>
            <div className="learn-article-content">
              <MarkdownArticleBody content={tool.contentMarkdown} variant="learn" />
            </div>
          </article>

          <aside className="learn-article-sidebar">
            <div className="learn-side-card">
              <h2>Start in seconds</h2>
              <p>Private, free, browser-only</p>
              <Link href={appLink}>Open {tool.title}</Link>
            </div>

            {tool.useCases.length > 0 && (
              <div className="learn-side-card">
                <h2>Best for</h2>
                <ul className="learn-side-list">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase}>{useCase}</li>
                  ))}
                </ul>
              </div>
            )}

            <RelatedLinks relatedTools={tool.relatedTools} relatedLearn={tool.relatedLearn} variant="dark" />

            {tool.keywords.length > 0 && (
              <div className="learn-side-card">
                <h2>Related searches</h2>
                <div className="learn-side-tags">
                  {tool.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="learn-side-card">
              <h2>Promise</h2>
              <div className="learn-side-promise">
                {["No upload", "No account", "Instant output", "Editable JSON"].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="h-px bg-[var(--learn-border)]" />

      <div className="learn-article-shell tool-landing-faq">
        <Eyebrow>FAQ</Eyebrow>
        <h2>Questions about {tool.title}</h2>
        <p>Everything you need to know before you start.</p>
        <FaqAccordion faqs={faqs} />
      </div>

      <div className="learn-article-shell tool-landing-cta">
        <div className="tool-landing-cta-card">
          <Eyebrow>Ready to use it?</Eyebrow>
          <h2>
            {tool.title},{" "}
            <span>free &amp; private.</span>
          </h2>
          <p>No account needed. Your JSON never leaves your browser.</p>
          <Link href={appLink} className="learn-button-primary">
            Launch {tool.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}









