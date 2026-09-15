

import { MarkdownArticleBody } from "./MarkdownArticleBody";
import { RelatedLinks } from "./site/RelatedLinks";
import { LearnCompletionButton } from "./learn/LearnProgress";
import { LearnDiagnostic } from "./learn/LearnDiagnostic";
import { LearnTableOfContents } from "./learn/LearnTableOfContents";
import type { TutorialSection } from "@/lib/learn-content";
import { readingMinutes } from "@/lib/learn-ui";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LearnArticlePageProps {
  section: TutorialSection;
  sections: TutorialSection[];
  levelLabel?: string;
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
}

function headingId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function LearnArticlePage({ section, sections, levelLabel, prev, next }: LearnArticlePageProps) {
  const headings = [...section.contentMarkdown.matchAll(/^## (.+)$/gm)].map((match) => {
    const label = match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "");
    return { id: headingId(label), label };
  });
  const updated = section.updatedAt || section.publishedAt;
  const ids = sections.map((item) => item.id);
  return (
    <div className="learn-article-grid">
      <article className="learn-article">
        <nav className="learn-breadcrumb" aria-label="Breadcrumb"><Link href="/learn/">Learn</Link><span>/</span><span>{levelLabel || section.level}</span><span>/</span><span>{section.title}</span></nav>
        <h1>{section.title}</h1>
        <div className="learn-article-meta"><span>{readingMinutes(section)} min read</span>{updated && <span>Updated <time dateTime={updated}>{new Date(`${updated}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time></span>}<LearnCompletionButton id={section.id} ids={ids} /></div>
        {section.metaDescription && <aside className="learn-quick-answer"><span className="learn-eyebrow">Quick answer</span><p>{section.metaDescription}</p></aside>}
        <LearnDiagnostic lessons={sections} compact />
        <div className="learn-article-content"><MarkdownArticleBody content={section.contentMarkdown} keyTerms={section.keyTerms} tryExample={section.tryExample} variant="learn" /></div>
        <div className="learn-article-related"><RelatedLinks relatedTools={section.relatedTools} relatedLearn={section.relatedLearn} variant="dark" /></div>
        <nav className="learn-article-next" aria-label="Article navigation">
          {prev ? <Link href={`/learn/${prev.id}/`}><span>← Previous</span><strong>{prev.title}</strong><ChevronLeft size={16} aria-hidden="true" /></Link> : <span />}
          {next ? <Link href={`/learn/${next.id}/`}><span>Next →</span><strong>{next.title}</strong><ChevronRight size={16} aria-hidden="true" /></Link> : <span />}
        </nav>
      </article>
      <aside className="learn-article-sidebar" aria-label="Lesson resources"><LearnTableOfContents headings={headings} /><div className="learn-side-card learn-side-cta"><h2>Fix it in the app</h2><p>Open the workspace to inspect or repair JSON locally.</p><Link href="/">Open in workspace →</Link></div></aside>
    </div>
  );
}
