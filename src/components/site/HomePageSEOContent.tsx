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
import { ToolDirectory } from "@/components/site/ToolDirectory";

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
  const tutorials = getTutorialSections();

  return (
    <div className="learn-section home-guide">
      <div className="learn-index-inner">
        <section className="learn-hero home-guide-hero">
          <div>
            <p className="learn-eyebrow">JSON Prism · {tools.length} tools · Free</p>
            <h1>The free, all-in-one JSON toolkit.</h1>
            <p className="learn-hero-description">
              Format, validate, compare and transform JSON in one browser workspace.
              Paste once, then move between tools without opening another tab.
            </p>
            <div className="learn-hero-actions">
              <Link href="/" className="learn-button-primary">Open the workspace <ArrowRight size={14} aria-hidden /></Link>
              <Link href="/learn/" className="learn-button-outline">Learn JSON</Link>
            </div>
          </div>
          <div className="learn-diagnostic home-guide-trust">
            <div className="learn-card-heading"><span className="learn-accent-dot" />One workspace, on your terms</div>
            {home.trustPoints.map((point, index) => {
              const Icon = [Lock, ShieldCheck, Code2][index] ?? ShieldCheck;
              return <div className="home-guide-trust-row" key={point}><Icon size={18} aria-hidden /><p>{point}</p></div>;
            })}
            <div className="home-guide-trust-note">For API responses, configs, test fixtures and generated payloads.</div>
          </div>
        </section>

        <section className="learn-paths" aria-labelledby="home-workflows">
          <h2 className="learn-eyebrow" id="home-workflows">Choose your workflow</h2>
          <div className="learn-path-grid home-guide-workflows">
            {CORE_WORKFLOWS.map((workflow, index) => {
              const Icon = workflow.icon;
              return <Link key={workflow.href} href={workflow.href}>
                <span className="home-guide-card-meta"><span>0{index + 1} / JSON tools</span><Icon size={16} aria-hidden /></span>
                <strong>{workflow.title}</strong>
                <small>{workflow.body}</small>
                <ArrowRight className="home-guide-card-arrow" size={16} aria-hidden />
              </Link>;
            })}
          </div>
        </section>

        <section className="learn-lessons" aria-labelledby="home-tools">
          <div className="home-guide-section-heading"><div><p className="learn-eyebrow">The complete toolkit</p><h2 id="home-tools">{tools.length} tools. One familiar workspace.</h2></div><Link href="/tools/">Browse tool pages <ArrowRight size={14} aria-hidden /></Link></div>
          <ToolDirectory tools={tools} />
        </section>

        <section className="learn-lessons" aria-labelledby="home-learn">
          <div className="home-guide-section-heading"><div><p className="learn-eyebrow">Learn by doing</p><h2 id="home-learn">From your first object to production JSON.</h2></div><Link href="/learn/">All {tutorials.length} lessons <ArrowRight size={14} aria-hidden /></Link></div>
          <div className="learn-path-grid home-guide-workflows">
            {tutorials.slice(0, 6).map((lesson, index) => <Link href={`/learn/${lesson.id}/`} key={lesson.id}>
              <span>Lesson {String(index + 1).padStart(2, "0")}</span>
              <strong>{lesson.title}</strong>
              <small>{lesson.metaDescription || lesson.excerpt}</small>
              <ArrowRight className="home-guide-card-arrow" size={16} aria-hidden />
            </Link>)}
          </div>
        </section>

        <section className="home-guide-faq" aria-labelledby="home-faq">
          <div><p className="learn-eyebrow">Good to know</p><h2 id="home-faq">A few common questions.</h2><p>More about the workspace, your data and getting started.</p></div>
          <div>{home.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden>+</span></summary><p>{faq.answer}</p></details>)}</div>
        </section>

        <div className="learn-quick-answer home-guide-privacy"><p className="learn-eyebrow">Privacy by design</p><p>Every operation runs locally in your browser. No JSON is uploaded or stored by default. Short links are strictly opt-in and expire after 30 days.</p></div>
        <footer className="home-guide-footer"><Link href="/" className="home-guide-brand">JSON Prism</Link><nav aria-label="Site links"><Link href="/tools/">Tools</Link><Link href="/learn/">Learn JSON</Link><Link href="/about/">About</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link></nav><p>© {new Date().getFullYear()} JSON Prism</p></footer>
      </div>
    </div>
  );
}
