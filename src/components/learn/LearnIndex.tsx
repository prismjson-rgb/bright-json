"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { TutorialSection } from "@/lib/learn-content";
import { isErrorLesson, readingMinutes } from "@/lib/learn-ui";
import { useLearnProgress } from "./LearnProgress";
import { LearnDiagnostic } from "./LearnDiagnostic";

interface Level { id: string; label: string; description: string }
type Filter = "all" | "errors" | "unread" | string;

export function LearnIndex({ sections, levels, heroDescription, originalEyebrow, originalTitle, tags, whyTitle, whyBody }: { sections: TutorialSection[]; levels: readonly Level[]; heroDescription: string; originalEyebrow?: string; originalTitle?: string; tags: string[]; whyTitle?: string; whyBody?: string }) {
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);
  const { done, toggle } = useLearnProgress(ids);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const visible = sections.filter((section) => {
    const searchable = `${section.title} ${section.metaDescription || ""} ${section.keyTerms.join(" ")}`.toLowerCase();
    if (query && !searchable.includes(query.trim().toLowerCase())) return false;
    if (filter === "errors") return isErrorLesson(section);
    if (filter === "unread") return !done.includes(section.id);
    if (filter !== "all") return section.level === filter;
    return true;
  });
  const choose = (next: Filter) => { setFilter(next); document.getElementById("lessons")?.scrollIntoView({ behavior: "smooth" }); };
  return (
    <div className="learn-index-inner">
      <section className="learn-hero">
        <div className="learn-hero-copy"><p className="learn-eyebrow">Learn JSON · {sections.length} lessons · free</p><h1>Learn JSON by fixing real JSON.</h1><p className="learn-hero-description">{heroDescription}</p><div className="learn-hero-actions"><Link className="learn-button-primary" href={`/learn/${sections[0]?.id || "what-is-json"}/`}>Start at lesson 01</Link><Link className="learn-button-outline" href="/learn/errors/">I have an error to fix →</Link></div></div>
        <LearnDiagnostic lessons={sections} />
      </section>

      <section className="learn-paths" aria-labelledby="learn-paths-title"><h2 id="learn-paths-title" className="learn-eyebrow">Pick a path</h2><div className="learn-path-grid">
        <button type="button" onClick={() => choose("beginner")}><span>{sections.filter((section) => section.level === "beginner").length} lessons · basics</span><strong>Absolute beginner</strong><small>What JSON is, the six types, syntax rules and your first object.</small></button>
        <Link href="/learn/errors/"><span>10 parser messages</span><strong>Fix an error fast</strong><small>Parser messages matched to a focused explanation and lesson.</small></Link>
        <button type="button" onClick={() => { setQuery("LLM"); choose("all"); }}><span>{sections.filter((section) => `${section.title} ${section.metaDescription || ""}`.toLowerCase().includes("llm")).length} lessons · LLM</span><strong>JSON for LLM work</strong><small>Fences, truncation, schema validation and token cost.</small></button>
        <button type="button" onClick={() => choose("expert")}><span>{sections.filter((section) => section.level === "expert").length} lessons · expert</span><strong>Production hardening</strong><small>Schema, big numbers, duplicate keys, depth limits and security.</small></button>
      </div></section>

      <section id="lessons" className="learn-lessons" aria-labelledby="learn-lessons-title"><div className="learn-lessons-top"><h2 id="learn-lessons-title" className="learn-eyebrow">{visible.length} lessons</h2><label className="learn-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search lessons</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="search lessons" /></label></div>
        <div className="learn-filters" role="group" aria-label="Filter lessons">{[{ id: "all", label: "All" }, { id: "errors", label: "Error fixes" }, { id: "unread", label: "Unread" }, ...levels.map((level) => ({ id: level.id, label: level.label }))].map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
        <div className="learn-lesson-list">{visible.map((section) => {
          const completed = done.includes(section.id);
          const level = levels.find((item) => item.id === section.level);
          return <div className="learn-lesson-row" key={section.id}><button type="button" className="learn-lesson-check" aria-label={`${completed ? "Mark unread" : "Mark complete"}: ${section.title}`} aria-pressed={completed} onClick={() => toggle(section.id)}><span>{completed ? "✓" : ""}</span></button><Link href={`/learn/${section.id}/`} className="learn-lesson-link"><strong>{section.title}</strong><span>{section.metaDescription || section.excerpt}</span></Link>{isErrorLesson(section) && <span className="learn-error-tag">error fix</span>}<span className="learn-reading-time">{readingMinutes(section)} min</span><span className="learn-lesson-level">{level?.label || section.level}</span></div>;
        })}{visible.length === 0 && <p className="learn-empty">No lesson matches that search. Try another term or filter.</p>}</div>
      </section>
      <section className="learn-course-overview" aria-labelledby="learn-course-overview-title">
        {originalEyebrow && <p className="learn-eyebrow">{originalEyebrow}</p>}
        <h2 id="learn-course-overview-title">{originalTitle || "JSON Tutorial"}</h2>
        <div className="learn-course-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>
      {(whyTitle || whyBody) && <aside className="learn-why"><h2>{whyTitle}</h2><p>{whyBody}</p></aside>}
    </div>
  );
}
