"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { CurlMeta } from "@/lib/tabs-storage";

interface CurlMetaBarProps {
  meta: CurlMeta;
  onRerun: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  POST: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  PUT: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  PATCH: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  DELETE: "text-red-600 dark:text-red-400 bg-red-500/10",
};

function statusColor(status: number): string {
  if (status >= 500) return "text-red-600 dark:text-red-400";
  if (status >= 400) return "text-orange-600 dark:text-orange-400";
  if (status >= 300) return "text-yellow-600 dark:text-yellow-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function truncateUrl(url: string, max = 55): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "") || "";
    const base = path ? `${u.hostname}${path}` : u.hostname;
    return base.length > max ? base.slice(0, max - 1) + "…" : base;
  } catch {
    return url.length > max ? url.slice(0, max - 1) + "…" : url;
  }
}

export default function CurlMetaBar({ meta, onRerun }: CurlMetaBarProps) {
  const [headersOpen, setHeadersOpen] = useState(false);

  const methodClass = METHOD_COLORS[meta.method] ?? "text-muted-foreground bg-secondary/50";
  const headerEntries = Object.entries(meta.responseHeaders).filter(
    ([k]) => !["transfer-encoding", "connection"].includes(k.toLowerCase())
  );

  return (
    <div className="border-b border-border/60 bg-surface1 shrink-0 select-none">
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] flex-wrap">
        {/* Method badge */}
        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${methodClass}`}>
          {meta.method}
        </span>

        {/* URL */}
        <span className="font-mono text-muted-foreground truncate max-w-[40ch]" title={meta.url}>
          {truncateUrl(meta.url)}
        </span>

        <span className="text-border/60">·</span>

        {/* Status */}
        <span className={`font-medium ${statusColor(meta.status)}`}>
          {meta.status} {meta.statusText}
        </span>

        <span className="text-border/60">·</span>

        {/* Timing */}
        <span className="text-muted-foreground">{meta.timing} ms</span>

        {/* Spacer */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Headers toggle */}
          {headerEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setHeadersOpen((o) => !o)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Toggle response headers"
            >
              Headers {headersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {/* Re-run */}
          <button
            type="button"
            onClick={onRerun}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Re-run this cURL command"
            aria-label="Re-run"
          >
            <RefreshCw className="w-3 h-3" />
            Re-run
          </button>
        </div>
      </div>

      {/* Headers panel */}
      {headersOpen && (
        <div className="border-t border-border/40 px-3 py-2 max-h-48 overflow-y-auto">
          <table className="w-full text-[10px] font-mono">
            <tbody>
              {headerEntries.map(([k, v]) => (
                <tr key={k} className="align-top">
                  <td className="pr-3 py-0.5 text-muted-foreground whitespace-nowrap">{k}</td>
                  <td className="py-0.5 text-foreground/80 break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
