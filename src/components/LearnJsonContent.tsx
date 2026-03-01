"use client";

import {
  LEARN_LEVELS,
  getSectionsByLevel,
  type TutorialSection,
} from "@/lib/learn-json-content";
import { encodeJson, isTooLarge } from "@/lib/share";

interface LearnJsonContentProps {
  standalone?: boolean;
  onTryInEditor?: (json: string) => void;
}

export function LearnJsonContent({ standalone, onTryInEditor }: LearnJsonContentProps) {
  return (
    <>
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
          Complete JSON Tutorial — From Beginner to Expert
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Master JSON (JavaScript Object Notation) from the ground up. Learn data types, syntax
          rules, REST APIs, JSON Schema, JSONPath, security, and more. Free, comprehensive, and
          designed for developers of all levels.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["JSON basics", "REST APIs", "JSON Schema", "JSONPath", "Security"].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <nav aria-label="Table of contents" className="mb-10 p-4 rounded-xl bg-surface2 border border-border">
        <h2 className="text-sm font-semibold text-foreground mb-3">Table of Contents</h2>
        <ol className="space-y-2 text-sm">
          {LEARN_LEVELS.map((lvl, i) => {
            const sections = getSectionsByLevel(lvl.id);
            return (
              <li key={lvl.id}>
                <a
                  href={`#level-${lvl.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {i + 1}. {lvl.label}
                </a>
                <ul className="ml-4 mt-1 space-y-0.5 text-muted-foreground">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="hover:text-foreground">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </nav>

      {LEARN_LEVELS.map((lvl) => (
        <LevelSection
          key={lvl.id}
          level={lvl}
          sections={getSectionsByLevel(lvl.id)}
          standalone={standalone}
          onTryInEditor={onTryInEditor}
        />
      ))}
    </>
  );
}

function LevelSection({
  level,
  sections,
  standalone,
  onTryInEditor,
}: {
  level: (typeof LEARN_LEVELS)[0];
  sections: TutorialSection[];
  standalone?: boolean;
  onTryInEditor?: (json: string) => void;
}) {
  return (
    <section id={`level-${level.id}`} className="mb-14 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground mb-2 border-b border-border pb-2">
        {level.label}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{level.description}</p>

      <div className="space-y-8">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            standalone={!!standalone}
            onTryInEditor={onTryInEditor}
          />
        ))}
      </div>
    </section>
  );
}

export function SectionBlock({
  section,
  standalone,
  onTryInEditor,
}: {
  section: TutorialSection;
  standalone?: boolean;
  onTryInEditor?: (json: string) => void;
}) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <h3 className="text-lg font-semibold text-foreground mb-3">{section.title}</h3>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p className="text-sm leading-relaxed">{section.content}</p>

        {section.bullets && (
          <ul className="space-y-2 list-disc list-inside">
            {section.bullets.map((b, i) => (
              <li key={i} className="text-sm">{b}</li>
            ))}
          </ul>
        )}

        {section.subSections?.map((sub, i) => (
          <div key={i} className="space-y-2">
            <h4 className="text-base font-medium text-foreground">{sub.title}</h4>
            <p className="text-sm">{sub.content}</p>
            {sub.code && (
              <CodeBlock
                code={sub.code}
                label={undefined}
                onTry={onTryInEditor}
                standalone={standalone}
              />
            )}
          </div>
        ))}

        {(section.code || section.tryExample) && (
          <CodeBlock
            code={section.code || section.tryExample!}
            label={section.codeLabel}
            onTry={onTryInEditor}
            tryLabel={section.tryExample ? "Try in JSON Prism" : undefined}
            standalone={standalone}
          />
        )}

        {section.keyTerms && section.keyTerms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {section.keyTerms.map((term) => (
              <span
                key={term}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {term}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CodeBlock({
  code,
  label,
  onTry,
  tryLabel,
  standalone,
}: {
  code: string;
  label?: string;
  onTry?: (json: string) => void;
  tryLabel?: string;
  standalone?: boolean;
}) {
  const isJson = (() => {
    const t = code.trim();
    return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
  })();
  const canTry = isJson && (!!onTry || !!standalone);

  const handleTry = () => {
    if (onTry) {
      onTry(code);
      return;
    }
    if (standalone && typeof window !== "undefined") {
      const encoded = encodeJson(code);
      const url = window.location.origin + "/#json=" + encoded;
      if (!isTooLarge(url)) {
        window.location.href = url;
      }
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden my-4">
      {label && (
        <div className="px-3 py-2 bg-surface2 text-xs text-muted-foreground border-b border-border">
          {label}
        </div>
      )}
      <pre className="text-xs font-mono text-foreground bg-background p-4 overflow-x-auto overflow-y-auto max-h-64">
        <code>{code}</code>
      </pre>
      {canTry && (
        <div className="px-3 py-2 bg-surface2 border-t border-border">
          <button
            type="button"
            onClick={handleTry}
            className="text-xs text-primary hover:underline font-medium"
          >
            {tryLabel || "Try in JSON Prism →"}
          </button>
        </div>
      )}
    </div>
  );
}
