"use client";

import { MarkdownArticleBody } from "./MarkdownArticleBody";
import type { TutorialSection } from "@/lib/learn-content";
import { encodeJson, isTooLarge } from "@/lib/share";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LearnArticlePageProps {
  section: TutorialSection;
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
}

export function LearnArticlePage({ section, prev, next }: LearnArticlePageProps) {
  const handleTryInEditor = (json: string) => {
    if (typeof window === "undefined") return;
    const encoded = encodeJson(json);
    const url = window.location.origin + "/#json=" + encoded;
    if (!isTooLarge(url)) {
      window.location.href = url;
    }
  };

  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          href="/learn/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          All tutorials
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {section.title}
        </h1>
      </div>

      <MarkdownArticleBody
        content={section.contentMarkdown}
        keyTerms={section.keyTerms}
        tryExample={section.tryExample}
        onTryInEditor={handleTryInEditor}
      />

      <nav
        className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 justify-between"
        aria-label="Article navigation"
      >
        {prev ? (
          <Link
            href={`/learn/${prev.id}/`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.id}/`}
            className="flex items-center gap-2 text-primary hover:underline ml-auto"
          >
            <span>{next.title}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
