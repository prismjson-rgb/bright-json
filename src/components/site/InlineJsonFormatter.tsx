"use client";
import { parseJsonSafe } from "@/lib/precise-json";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Copy, RotateCcw, XCircle } from "lucide-react";
import { encodeJson } from "@/lib/share";

const SAMPLE_JSON = `{"user":{"id":1042,"name":"Dana","roles":["admin","editor"],"active":true},"created":"2024-01-15"}`;

interface InlineJsonFormatterProps {
  appHref: string;
  title: string;
}

/**
 * Lightweight paste-and-format widget for tool landing pages. Deliberately
 * plain textarea/pre (no Monaco) so the marketing page stays fast - the full
 * editor experience lives behind "Open in full editor", one click away.
 */
export function InlineJsonFormatter({ appHref, title }: InlineJsonFormatterProps) {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copied, setCopied] = useState(false);

  const { output, error, isEmpty } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null, isEmpty: true };
    try {
      const parsed = parseJsonSafe(input);
      return { output: JSON.stringify(parsed, null, 2), error: null as string | null, isEmpty: false };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid JSON", isEmpty: false };
    }
  }, [input]);

  const handleMinify = () => {
    try {
      setInput(JSON.stringify(parseJsonSafe(input)));
    } catch {
      /* leave input untouched - the error banner already explains why */
    }
  };

  const handleReset = () => setInput(SAMPLE_JSON);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard permissions denied - button just won't confirm */
    }
  };

  const editorHref = useMemo(() => {
    const source = output || input;
    if (!source.trim()) return appHref;
    return `${appHref}#json=${encodeJson(source)}`;
  }, [appHref, output, input]);

  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-3xl bg-cyan-500/[0.04] blur-3xl pointer-events-none" aria-hidden />
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b1624] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
        {/* Header bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-90" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] opacity-90" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] opacity-90" />
          </div>
          <span className="truncate font-mono text-[11px] text-slate-500">{title} - try it live</span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMinify}
              className="min-h-10 rounded-md border border-white/10 px-3 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/25 hover:text-white"
            >
              Minify
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-10 items-center gap-1 rounded-md border border-white/10 px-3 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex min-h-10 items-center gap-1 rounded-md border border-white/10 px-3 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy output"}
            </button>
          </div>
        </div>

        {/* Input / output */}
        <div className="grid gap-px bg-white/[0.06] lg:grid-cols-2">
          <div className="bg-[#0b1624] p-4">
            <label htmlFor="inline-json-input" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Paste JSON
            </label>
            <textarea
              id="inline-json-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="h-56 w-full resize-none bg-transparent font-mono text-[12.5px] leading-[1.6] text-slate-200 outline-none placeholder:text-slate-600"
              placeholder="Paste JSON here…"
            />
          </div>
          <div className="bg-[#0b1624] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">
              Formatted output
              {!isEmpty && !error && <CheckCircle2 className="h-3 w-3" />}
            </p>
            {error ? (
              <div className="flex h-56 flex-col gap-2 overflow-y-auto">
                <div className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="font-mono text-[11px] leading-5 text-red-300">{error}</p>
                </div>
              </div>
            ) : (
              <pre className="h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-[12.5px] leading-[1.6] text-slate-200">
                {output || <span className="text-slate-600">Output appears here…</span>}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.01] px-4 py-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Runs in your browser · nothing uploaded
          </span>
          <Link
            href={editorHref}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-[12px] font-semibold text-slate-950 transition-all hover:bg-cyan-200 hover:-translate-y-0.5"
          >
            Open in full editor
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
