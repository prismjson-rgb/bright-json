"use client";

import { useState } from "react";
import Link from "next/link";
import type { TutorialSection } from "@/lib/learn-content";

const ERROR_MESSAGES = [
  { message: "Unexpected token < in JSON at position 0", cause: "You received an HTML page — a 404, 500 or login redirect.", lesson: "unexpected-token-in-json" },
  { message: "Unexpected end of JSON input", cause: "Empty body, truncated response or an unclosed bracket.", lesson: "unexpected-end-of-json-input" },
  { message: "Unexpected token } in JSON", cause: "A trailing comma before the closing brace.", lesson: "fixing-trailing-commas" },
  { message: "Unexpected token ' in JSON", cause: "Single quotes — JSON requires double quotes.", lesson: "fix-single-quotes-json" },
  { message: "Expecting property name enclosed in double quotes", cause: "Unquoted object keys, commonly reported by Python.", lesson: "fix-unquoted-keys-json" },
  { message: "Unexpected token BOM in JSON at position 0", cause: "An invisible byte-order mark before the first brace.", lesson: "json-bom-error" },
  { message: "Unexpected token o in JSON at position 1", cause: "An object was passed to JSON.parse instead of a JSON string.", lesson: "parse-stringify" },
  { message: "Unexpected non-whitespace character after JSON", cause: "Two JSON documents were concatenated; JSONL may fit better.", lesson: "json-vs-jsonl" },
  { message: "Unexpected string in JSON at position N", cause: "A comma is missing between two members.", lesson: "missing-comma-json" },
  { message: "Bad control character in string literal", cause: "A raw newline or tab inside a string needs escaping.", lesson: "escaping-special-chars" },
] as const;

export function LearnErrorHub({ sections }: { sections: TutorialSection[] }) {
  const [query, setQuery] = useState("");
  const errors = ERROR_MESSAGES.map((entry) => ({ ...entry, section: sections.find((section) => section.id === entry.lesson) })).filter((entry) => entry.section && `${entry.message} ${entry.cause} ${entry.section.title}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="learn-index-inner learn-error-hub"><p className="learn-eyebrow">New hub page · /learn/errors/</p><h1>Every JSON error message, and the one line that fixes it.</h1><p className="learn-hero-description">Search the message your parser printed to find the cause and a focused lesson. Your JSON can be diagnosed locally on the <Link href="/learn/">Learn index</Link>.</p><label className="learn-search"><span className="sr-only">Search JSON errors</span><input type="search" placeholder="e.g. unexpected end of JSON input" value={query} onChange={(event) => setQuery(event.target.value)} /></label><section className="learn-lessons" aria-label="JSON parser errors"><div className="learn-lesson-list">{errors.map((entry) => <Link href={`/learn/${entry.lesson}/`} className="learn-error-row" key={entry.message}><strong>{entry.message}</strong><span>{entry.cause}</span><b>→ {entry.section?.title}</b></Link>)}{errors.length === 0 && <p className="learn-empty">No matching message. Try a shorter phrase or use the JSON debugger in the workspace.</p>}</div></section></div>;
}
