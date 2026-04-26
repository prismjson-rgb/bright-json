"use client";
import { useEffect, useRef, useState } from "react";
import { X, Loader2, Play, TerminalSquare, Share2, Check } from "lucide-react";
import { AppButton } from "@/components/app/AppButton";
import { encodeCurlCmd } from "@/lib/share";
import { createShortLink, isShortLinkConfigured, extractSharePayload } from "@/lib/short-link";

interface CurlPanelProps {
  open: boolean;
  onClose: () => void;
  initialCommand?: string;
  onRun: (command: string, signal: AbortSignal) => Promise<boolean>;
}

const SAMPLE = `curl -X POST https://jsonplaceholder.typicode.com/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"foo","body":"bar","userId":1}'`;

export default function CurlPanel({ open, onClose, initialCommand, onRun }: CurlPanelProps) {
  const [command, setCommand] = useState(initialCommand ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "sharing" | "copied">("idle");
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync command and reset state when panel opens
  useEffect(() => {
    if (!open) return;
    setError(null);
    setShareState("idle");
    if (initialCommand !== undefined) setCommand(initialCommand);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open, initialCommand]);

  const handleShare = async () => {
    if (shareState === "sharing" || !command.trim()) return;
    setShareState("sharing");
    try {
      const encoded = await encodeCurlCmd(command.trim());
      const fullUrl = `${window.location.origin}/#curlcmd=${encoded}`;
      let urlToCopy = fullUrl;
      if (isShortLinkConfigured()) {
        const extracted = extractSharePayload(fullUrl);
        if (extracted) {
          const result = await createShortLink(extracted.kind, extracted.payload);
          if (result.ok) urlToCopy = result.url;
        }
      }
      await navigator.clipboard.writeText(urlToCopy);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("idle");
    }
  };

  const handleRun = async () => {
    if (loading || !command.trim()) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const ok = await onRun(command.trim(), ac.signal);
      if (ok) onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      if (abortRef.current === ac) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="cURL Request">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Close"
      />

      {/* Panel — slides in from right */}
      <aside
        data-state="open"
        className="relative ml-auto w-full max-w-md sm:max-w-lg h-full bg-surface1 border-l border-border shadow-2xl flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <TerminalSquare className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm text-foreground">cURL Request</span>
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col p-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="curl-input">
              Paste your curl command
            </label>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Supports{" "}
              <code className="font-mono bg-secondary/60 px-0.5 rounded">-X</code>,{" "}
              <code className="font-mono bg-secondary/60 px-0.5 rounded">-H</code>,{" "}
              <code className="font-mono bg-secondary/60 px-0.5 rounded">-d</code>,{" "}
              <code className="font-mono bg-secondary/60 px-0.5 rounded">--json</code>,{" "}
              <code className="font-mono bg-secondary/60 px-0.5 rounded">-u</code>.{" "}
              Cross-origin APIs must send CORS headers.
            </p>
          </div>

          <textarea
            id="curl-input"
            ref={textareaRef}
            value={command}
            onChange={(e) => { setCommand(e.target.value); setError(null); }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void handleRun();
              }
            }}
            placeholder={SAMPLE}
            rows={10}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            disabled={loading}
            className="w-full font-mono text-xs bg-surface2 border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 leading-relaxed"
          />

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive leading-snug">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <AppButton
              variant="accent"
              className="flex-1 justify-center py-2.5"
              onClick={() => void handleRun()}
              disabled={loading || !command.trim()}
              leftIcon={
                loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )
              }
              label={loading ? "Running…" : "Run  ⌘↵"}
            />
            <AppButton
              variant="ghost"
              className="px-3 py-2.5 border border-border shrink-0"
              onClick={() => void handleShare()}
              disabled={loading || !command.trim() || shareState === "sharing"}
              leftIcon={
                shareState === "copied" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : shareState === "sharing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )
              }
              label={shareState === "copied" ? "Copied!" : "Share curl"}
              title="Copy a link to this curl command (without running it)"
            />
          </div>

          {/* Tips */}
          <div className="mt-auto pt-2 border-t border-border/60 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Tips
            </p>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-snug">
              <li>
                <span className="font-mono text-foreground/70">-H &quot;Authorization: Bearer TOKEN&quot;</span>
                {" "}— pass auth headers directly
              </li>
              <li>
                Use <span className="font-mono text-foreground/70">\</span> to break long commands across lines
              </li>
              <li>
                The response body loads into a new tab — works with any JSON API
              </li>
              <li className="text-muted-foreground/50">
                Note: browser fetch requires CORS — some APIs block cross-origin requests
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
