"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight } from "lucide-react";
import { encodeJson, isTooLarge } from "@/lib/share";

interface MarkdownArticleBodyProps {
  content: string;
  keyTerms?: string[];
  tryExample?: string;
  onTryInEditor?: (json: string) => void;
  variant?: "default" | "landing";
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
      const url = window.location.origin + "/app/#json=" + encoded;
      if (!isTooLarge(url)) {
        window.location.href = url;
      }
    }
  };

  return (
    <div className="group my-6 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090d17] shadow-[0_24px_80px_-32px_rgba(34,211,238,0.45)]">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
          JSON
        </span>
      </div>
      <pre className="max-h-[360px] overflow-auto bg-[#080b14] p-4 font-mono text-xs leading-6 text-slate-200 sm:p-5">
        <code>{code}</code>
      </pre>
      {isJson && (
        <div className="border-t border-white/[0.07] bg-white/[0.03] px-4 py-3">
          <button
            type="button"
            onClick={handleTry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Try in JSON Prism
            <ArrowRight className="h-3.5 w-3.5" />
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
  variant = "default",
}: MarkdownArticleBodyProps) {
  const isLanding = variant === "landing";

  return (
    <section
      className={
        isLanding
          ? "max-w-none space-y-7 text-slate-400 [overflow-wrap:break-word] [word-break:break-word]"
          : "prose prose-sm max-w-none space-y-4 text-muted-foreground [overflow-wrap:break-word] [word-break:break-word]"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p
              className={
                isLanding
                  ? "max-w-3xl text-[15px] leading-8 text-slate-400"
                  : "text-sm leading-relaxed"
              }
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={
                isLanding
                  ? "grid gap-3 sm:grid-cols-2 [&>li]:pl-11 [&>li]:before:absolute [&>li]:before:left-4 [&>li]:before:top-5 [&>li]:before:h-2 [&>li]:before:w-2 [&>li]:before:rounded-full [&>li]:before:bg-emerald-300 [&>li]:before:shadow-[0_0_18px_rgba(110,231,183,0.4)]"
                  : "space-y-1 list-inside list-disc"
              }
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={
                isLanding
                  ? "grid gap-3 [counter-reset:step] sm:grid-cols-2 [&>li]:pl-[4.25rem] [&>li]:before:absolute [&>li]:before:left-4 [&>li]:before:top-4 [&>li]:before:flex [&>li]:before:h-9 [&>li]:before:w-9 [&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:rounded-xl [&>li]:before:border [&>li]:before:border-cyan-300/25 [&>li]:before:bg-cyan-300/10 [&>li]:before:font-mono [&>li]:before:text-xs [&>li]:before:font-semibold [&>li]:before:text-cyan-300 [&>li]:before:content-[counter(step,decimal-leading-zero)] [&>li]:[counter-increment:step]"
                  : "space-y-1 list-inside list-decimal"
              }
            >
              {children}
            </ol>
          ),
          li: ({ children }) => {
            if (!isLanding) {
              return <li className="text-sm">{children}</li>;
            }

            return (
              <li className="relative list-none rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-sm leading-6 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                {children}
              </li>
            );
          },
          h2: ({ children }) => (
            <div className={isLanding ? "pt-5 first:pt-0" : ""}>
              <h2
                className={
                  isLanding
                    ? "relative mb-4 flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                    : "mt-6 mb-2 text-lg font-semibold text-foreground"
                }
              >
                {isLanding && (
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.65)]" />
                )}
                {children}
              </h2>
            </div>
          ),
          h3: ({ children }) => (
            <h3
              className={
                isLanding
                  ? "mt-5 text-lg font-semibold text-white"
                  : "mt-4 mb-2 text-base font-medium text-foreground"
              }
            >
              {children}
            </h3>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className={
                isLanding
                  ? "font-medium text-cyan-300 underline decoration-cyan-300/35 underline-offset-4 transition-colors hover:text-cyan-200"
                  : "text-primary underline underline-offset-2 hover:opacity-80"
              }
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={isLanding ? "font-semibold text-white" : "font-semibold text-foreground"}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className={isLanding ? "my-8 border-white/[0.08]" : "my-4 border-border"} />,
          table: ({ children }) => (
            <div className={isLanding ? "my-6 overflow-x-auto rounded-2xl border border-white/[0.08]" : "my-4 overflow-x-auto"}>
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={isLanding ? "border-b border-white/[0.08] bg-white/[0.04]" : "border-b border-border"}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className={isLanding ? "border-b border-white/[0.06] last:border-b-0" : "border-b border-border/50"}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className={isLanding ? "px-4 py-3 text-left font-semibold text-white" : "px-3 py-2 text-left font-semibold text-foreground"}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={isLanding ? "px-4 py-3 text-slate-400" : "px-3 py-2 text-muted-foreground"}>
              {children}
            </td>
          ),
          pre: ({ children }) => {
            const codeEl = React.Children.only(children) as React.ReactElement;
            const code = String(codeEl?.props?.children ?? "").replace(/\n$/, "");
            const lang = codeEl?.props?.className?.replace(/^language-/, "");
            return <CodeBlock code={code} lang={lang} onTry={onTryInEditor} />;
          },
          code: (props) => {
            const { children } = props;
            const isInline =
              !("className" in props) ||
              !String(props.className ?? "").startsWith("language-");
            if (isInline) {
              return (
                <code
                  className={
                    isLanding
                      ? "rounded-md border border-white/[0.08] bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-slate-200"
                      : "rounded bg-surface2 px-1 py-0.5 font-mono text-xs"
                  }
                >
                  {children}
                </code>
              );
            }
            return <code className={String(props.className ?? "")}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {tryExample && <CodeBlock code={tryExample} lang="json" onTry={onTryInEditor} />}

      {keyTerms && keyTerms.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {keyTerms.map((term) => (
            <span
              key={term}
              className={
                isLanding
                  ? "rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200"
                  : "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              }
            >
              {term}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
