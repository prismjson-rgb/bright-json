"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { encodeJson, isTooLarge } from "@/lib/share";

interface MarkdownArticleBodyProps {
  content: string;
  keyTerms?: string[];
  tryExample?: string;
  onTryInEditor?: (json: string) => void;
}

function CodeBlock({
  code,
  lang,
  onTry,
}: {
  code: string;
  lang?: string;
  onTry?: (json: string) => void;
}) {
  const trimmed = code.trim();
  const isJson =
    lang === "json" ||
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));

  const handleTry = () => {
    if (onTry) {
      onTry(code);
      return;
    }
    if (typeof window !== "undefined") {
      const encoded = encodeJson(code);
      const url = window.location.origin + "/#json=" + encoded;
      if (!isTooLarge(url)) {
        window.location.href = url;
      }
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden my-4">
      <pre className="text-xs font-mono text-foreground bg-background p-4 overflow-x-auto overflow-y-auto max-h-64">
        <code>{code}</code>
      </pre>
      {isJson && (
        <div className="px-3 py-2 bg-surface2 border-t border-border">
          <button
            type="button"
            onClick={handleTry}
            className="text-xs text-primary hover:underline font-medium"
          >
            Try in JSON Prism →
          </button>
        </div>
      )}
    </div>
  );
}

export function MarkdownArticleBody({
  content,
  keyTerms,
  tryExample,
  onTryInEditor,
}: MarkdownArticleBodyProps) {
  return (
    <section className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="text-sm leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 list-disc list-inside">{children}</ul>
          ),
          li: ({ children }) => <li className="text-sm">{children}</li>,
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-foreground mt-6 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-foreground mt-4 mb-2">
              {children}
            </h3>
          ),
          pre: ({ children }) => {
            const codeEl = React.Children.only(children) as React.ReactElement;
            const code = String(codeEl?.props?.children ?? "").replace(/\n$/, "");
            const lang = codeEl?.props?.className?.replace(/^language-/, "");
            return (
              <CodeBlock code={code} lang={lang} onTry={onTryInEditor} />
            );
          },
          code: (props) => {
            const { children, className } = props;
            const inline = "inline" in props && (props as { inline?: boolean }).inline;
            if (inline) {
              return (
                <code className="rounded bg-surface2 px-1 py-0.5 text-xs font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {tryExample && (
        <CodeBlock
          code={tryExample}
          lang="json"
          onTry={onTryInEditor}
        />
      )}

      {keyTerms && keyTerms.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {keyTerms.map((term) => (
            <span
              key={term}
              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {term}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
