"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Link2, Plus, Trash2, Copy, Check, Download,
  FileCode, Package, Lock, ChevronDown, Sparkles, X, AlertTriangle,
  Loader2, Zap,
} from "lucide-react";
import { encodeJsonAsync, encodeBundleAsync, type BundleEntry } from "@/lib/share";
import { generateHtml } from "@/lib/html-export";
import type { TabData } from "@/lib/tabs-storage";
import { AppButton } from "@/components/app/AppButton";
import {
  createShortLink,
  extractSharePayload,
  isShortLinkConfigured,
  type ShortLinkResult,
} from "@/lib/short-link";

interface JsonSharePanelProps {
  json: string;
  onDownloadJson: (json?: string, filename?: string) => void;
  onClose?: () => void;
  tabs?: TabData[];
  activeTabId?: string;
}

type Section = "link" | "bundle" | "export";

type LinkStatus = "empty" | "ok" | "too-large" | "failed";

type ShortState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; shortUrl: string; expiresInSeconds: number }
  | { kind: "error"; message: string };

// Rough cap where URLs start running into browser/server limits. Past this,
// nudge the user toward the opt-in short link or file export.
const URL_LENGTH_WARN = 8000;

const shortEnabled = isShortLinkConfigured();

function shortErrorMessage(r: Exclude<ShortLinkResult, { ok: true }>): string {
  switch (r.code) {
    case "too-large":
      return `Payload is larger than the shortener limit (${Math.round(r.limit / 1024)} KB). Use Export below.`;
    case "network":
      return "Couldn't reach the shortener. Check your connection and try again.";
    case "server":
      return `Shortener returned an error (${r.status}). Try again in a moment.`;
    case "not-configured":
      return "Short-link service isn't configured for this build.";
    case "aborted":
      return "";
  }
}

export default function JsonSharePanel({ json, onDownloadJson, onClose, tabs = [], activeTabId }: JsonSharePanelProps) {
  const [open, setOpen] = useState<Section>("link");
  const [shareScope, setShareScope] = useState<"current" | "selected" | "all">("current");
  const [exportScope, setExportScope] = useState<"current" | "selected" | "all">("current");
  const [selectedTabIds, setSelectedTabIds] = useState<Set<string>>(() =>
    new Set(activeTabId ? [activeTabId] : [])
  );

  const hasMultipleTabs = tabs.length > 1;
  const hasJson = !!json.trim();

  const useBundleForShare = hasMultipleTabs && shareScope !== "current";

  // Cheap, memoized: builds the string/entries to encode. Encoding itself happens
  // off the main thread in the effect below so typing large JSON stays smooth.
  const shareInput = useMemo<
    | { kind: "empty" }
    | { kind: "single"; data: string }
    | { kind: "bundle"; data: BundleEntry[] }
  >(() => {
    if (!useBundleForShare) {
      return json.trim() ? { kind: "single", data: json } : { kind: "empty" };
    }
    const ids = shareScope === "all" ? tabs.map((t) => t.id) : Array.from(selectedTabIds);
    const entries = tabs
      .filter((t) => ids.includes(t.id) && t.json.trim())
      .map((t) => ({ title: t.name, json: t.json }));
    return entries.length ? { kind: "bundle", data: entries } : { kind: "empty" };
  }, [json, tabs, shareScope, selectedTabIds, useBundleForShare]);

  const toggleTabSelection = (id: string) => {
    setSelectedTabIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Share via Link ─────────────────────────────── */
  const [shareUrl, setShareUrl]     = useState("");
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("empty");
  const [copiedLink, setCopiedLink] = useState(false);
  const [shortLinkState, setShortLinkState] = useState<ShortState>({ kind: "idle" });
  const [copiedShortLink, setCopiedShortLink] = useState(false);
  const shortLinkAbortRef = useRef<AbortController | null>(null);

  const shareHasJson = shareInput.kind !== "empty";

  useEffect(() => {
    if (shareInput.kind === "empty") {
      setShareUrl("");
      setLinkStatus("empty");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const url = shareInput.kind === "bundle"
          ? window.location.origin + "/bundle/#bundle=" + await encodeBundleAsync(shareInput.data)
          : window.location.origin + "/#json=" + await encodeJsonAsync(shareInput.data);
        if (cancelled) return;
        setShareUrl(url);
        setLinkStatus(url.length > URL_LENGTH_WARN ? "too-large" : "ok");
      } catch {
        if (!cancelled) setLinkStatus("failed");
      }
    })();

    return () => { cancelled = true; };
  }, [shareInput]);

  // Invalidate the short link whenever the underlying full link changes — a
  // stale short link would silently redirect to the old payload.
  useEffect(() => {
    shortLinkAbortRef.current?.abort();
    setShortLinkState({ kind: "idle" });
  }, [shareUrl]);

  useEffect(() => () => shortLinkAbortRef.current?.abort(), []);

  const handleCreateShortLink = useCallback(async () => {
    if (!shareUrl) return;
    const extracted = extractSharePayload(shareUrl);
    if (!extracted) return;

    shortLinkAbortRef.current?.abort();
    const ctrl = new AbortController();
    shortLinkAbortRef.current = ctrl;
    setShortLinkState({ kind: "pending" });

    const result = await createShortLink(extracted.kind, extracted.payload, ctrl.signal);
    if (ctrl.signal.aborted) return;
    if (result.ok === true) {
      setShortLinkState({
        kind: "success",
        shortUrl: result.url,
        expiresInSeconds: result.expiresInSeconds,
      });
      return;
    }
    if (result.code !== "aborted") {
      setShortLinkState({ kind: "error", message: shortErrorMessage(result) });
    }
  }, [shareUrl]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1600);
  };

  const handleCopyShortLink = () => {
    if (shortLinkState.kind !== "success") return;
    navigator.clipboard.writeText(shortLinkState.shortUrl);
    setCopiedShortLink(true);
    setTimeout(() => setCopiedShortLink(false), 1600);
  };

  /* ── Bundle ─────────────────────────────────────── */
  const [bundleEntries, setBundleEntries] = useState<BundleEntry[]>([{ title: "My JSON", json: "" }]);

  const useAllTabsAsBundle = useCallback(() => {
    const entries = tabs.filter((t) => t.json.trim()).map((t) => ({ title: t.name, json: t.json }));
    if (entries.length) setBundleEntries(entries);
  }, [tabs]);
  const [bundleUrl, setBundleUrl]       = useState("");
  const [bundleStatus, setBundleStatus] = useState<LinkStatus>("empty");
  const [copiedBundle, setCopiedBundle] = useState(false);
  const [shortBundleState, setShortBundleState] = useState<ShortState>({ kind: "idle" });
  const [copiedShortBundle, setCopiedShortBundle] = useState(false);
  const bundleAbortRef = useRef<AbortController | null>(null);
  const shortBundleAbortRef = useRef<AbortController | null>(null);

  const generateBundleUrl = useCallback(async () => {
    const valid = bundleEntries.filter(e => e.title.trim() && e.json.trim());
    if (!valid.length) return;

    bundleAbortRef.current?.abort();
    const ctrl = new AbortController();
    bundleAbortRef.current = ctrl;

    try {
      const encoded = await encodeBundleAsync(valid);
      if (ctrl.signal.aborted) return;
      const url = window.location.origin + "/bundle/#bundle=" + encoded;
      setBundleUrl(url);
      setBundleStatus(url.length > URL_LENGTH_WARN ? "too-large" : "ok");
    } catch {
      if (!ctrl.signal.aborted) setBundleStatus("failed");
    }
  }, [bundleEntries]);

  useEffect(() => () => bundleAbortRef.current?.abort(), []);

  useEffect(() => {
    shortBundleAbortRef.current?.abort();
    setShortBundleState({ kind: "idle" });
  }, [bundleUrl]);

  useEffect(() => () => shortBundleAbortRef.current?.abort(), []);

  const handleCopyBundle = () => {
    if (!bundleUrl) return;
    navigator.clipboard.writeText(bundleUrl);
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 1600);
  };

  const handleCreateShortBundleLink = useCallback(async () => {
    if (!bundleUrl) return;
    const extracted = extractSharePayload(bundleUrl);
    if (!extracted) return;

    shortBundleAbortRef.current?.abort();
    const ctrl = new AbortController();
    shortBundleAbortRef.current = ctrl;
    setShortBundleState({ kind: "pending" });

    const result = await createShortLink(extracted.kind, extracted.payload, ctrl.signal);
    if (ctrl.signal.aborted) return;
    if (result.ok === true) {
      setShortBundleState({
        kind: "success",
        shortUrl: result.url,
        expiresInSeconds: result.expiresInSeconds,
      });
      return;
    }
    if (result.code !== "aborted") {
      setShortBundleState({ kind: "error", message: shortErrorMessage(result) });
    }
  }, [bundleUrl]);

  const handleCopyShortBundle = () => {
    if (shortBundleState.kind !== "success") return;
    navigator.clipboard.writeText(shortBundleState.shortUrl);
    setCopiedShortBundle(true);
    setTimeout(() => setCopiedShortBundle(false), 1600);
  };

  const getExportData = (): { json: string; filename: string; isBundle: boolean } => {
    if (!hasMultipleTabs || exportScope === "current") {
      return { json, filename: "data.json", isBundle: false };
    }
    const ids = exportScope === "all" ? tabs.map((t) => t.id) : Array.from(selectedTabIds);
    const entries = tabs.filter((t) => ids.includes(t.id) && t.json.trim()).map((t) => ({ title: t.name, json: t.json }));
    return {
      json: JSON.stringify(entries, null, 2),
      filename: "bundle.json",
      isBundle: true,
    };
  };

  const exportHasJson = (() => {
    if (!hasMultipleTabs || exportScope === "current") return hasJson;
    if (exportScope === "all") return tabs.some((t) => t.json.trim());
    return tabs.some((t) => selectedTabIds.has(t.id) && t.json.trim());
  })();

  const addEntry    = () => setBundleEntries(e => [...e, { title: `Entry ${e.length + 1}`, json: "" }]);
  const removeEntry = (idx: number) => setBundleEntries(e => e.filter((_, i) => i !== idx));
  const updateEntry = (idx: number, field: keyof BundleEntry, value: string) =>
    setBundleEntries(e => e.map((ent, i) => i === idx ? { ...ent, [field]: value } : ent));
  const applyCurrentJson = (idx: number) => updateEntry(idx, "json", json);

  /* ── HTML Export ─────────────────────────────────── */
  const handleHtmlExport = () => {
    const { json: toExport } = getExportData();
    if (!toExport.trim()) return;
    const html = generateHtml(toExport);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "json-export.html" }).click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const { json: toExport, filename } = getExportData();
    if (!toExport.trim()) return;
    onDownloadJson(toExport, filename);
  };


  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="pane-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Share &amp; Export</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Privacy banner */}
      <div className="flex items-start gap-2 px-4 py-2.5 border-b border-border bg-primary/5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3 text-primary mt-0.5 shrink-0" />
        <span>
          <strong className="text-foreground font-medium">Zero storage by default.</strong>{" "}
          Your JSON is encoded into the link itself.{shortEnabled ? (
            <> Optional short links store the encoded payload for 30 days on our own Cloudflare KV — auto-deleted after.</>
          ) : null}
        </span>
      </div>

      <div className="flex flex-col">

        {/* ── Section 1: Share via Link ── */}
        <SectionHeader
          label="Share via Link"
          icon={<Link2 className="w-3.5 h-3.5 text-primary" />}
          open={open === "link"}
          onToggle={() => setOpen(s => s === "link" ? "export" : "link")}
          badge={shareHasJson ? "Ready" : undefined}
        />

        {open === "link" && (
          <div className="px-4 py-4 flex flex-col gap-3 border-b border-border">
            {hasMultipleTabs && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-muted-foreground">Share</span>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="shareScope" checked={shareScope === "current"} onChange={() => setShareScope("current")} className="rounded-full" />
                    <span className="text-xs">Current tab</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="shareScope" checked={shareScope === "selected"} onChange={() => setShareScope("selected")} className="rounded-full" />
                    <span className="text-xs">Selected tabs</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="shareScope" checked={shareScope === "all"} onChange={() => setShareScope("all")} className="rounded-full" />
                    <span className="text-xs">All tabs (bundle)</span>
                  </label>
                </div>
                {shareScope === "selected" && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tabs.map((t) => (
                      <label key={t.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={selectedTabIds.has(t.id)} onChange={() => toggleTabSelection(t.id)} className="rounded" />
                        <span className="text-[11px] truncate max-w-[100px]">{t.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!shareHasJson ? (
              <p className="text-xs text-muted-foreground">Paste JSON in the editor first.</p>
            ) : (
              <>
                {/* URL display + copy */}
                <div className="flex items-center gap-2">
                  <input
                    readOnly value={shareUrl}
                    className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                    onClick={e => (e.target as HTMLInputElement).select()}
                  />
                  <CopyBtn copied={copiedLink} onClick={handleCopyLink} />
                </div>

                <LinkStatusLine status={linkStatus} charCount={shareUrl.length} />

                {shortEnabled && shareUrl && (
                  <ShortLinkControls
                    state={shortLinkState}
                    copied={copiedShortLink}
                    onCreate={handleCreateShortLink}
                    onCopy={handleCopyShortLink}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── Section 2: Bundle ── */}
        <SectionHeader
          label="Bundle Multiple JSONs"
          icon={<Package className="w-3.5 h-3.5 text-primary" />}
          open={open === "bundle"}
          onToggle={() => setOpen(s => s === "bundle" ? "link" : "bundle")}
          badge={bundleUrl ? "Ready" : undefined}
        />

        {open === "bundle" && (
          <div className="px-4 py-4 flex flex-col gap-3 border-b border-border">
            <p className="text-[11px] text-muted-foreground/70">
              Combine multiple JSONs into one link — like a Linktree for JSON. Recipients can browse and open each one.
            </p>

            <div className="flex flex-col gap-2">
              {bundleEntries.map((entry, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2">
                    <input
                      value={entry.title}
                      onChange={e => updateEntry(idx, "title", e.target.value)}
                      placeholder="Entry title…"
                      className="flex-1 text-xs bg-background border border-border rounded-md px-2.5 py-1.5 outline-none focus:border-primary/40 transition-colors"
                    />
                    <button
                      onClick={() => applyCurrentJson(idx)}
                      className="text-[10px] text-primary hover:underline shrink-0"
                      title="Paste current editor JSON"
                    >
                      Use editor
                    </button>
                    {bundleEntries.length > 1 && (
                      <button onClick={() => removeEntry(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={entry.json}
                    onChange={e => updateEntry(idx, "json", e.target.value)}
                    placeholder='{"paste": "your JSON here"}'
                    rows={3}
                    className="w-full text-[11px] font-mono bg-background border border-border rounded-md px-2.5 py-1.5 resize-y outline-none focus:border-primary/40 transition-colors min-h-[60px]"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AppButton
                onClick={addEntry}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                label="Add JSON"
              />
              {hasMultipleTabs && (
                <AppButton
                  variant="accent"
                  onClick={useAllTabsAsBundle}
                  leftIcon={<Package className="w-3.5 h-3.5" />}
                  label="Use all tabs"
                />
              )}
              <AppButton
                onClick={generateBundleUrl}
                className="ml-auto"
                leftIcon={<Package className="w-3.5 h-3.5 text-primary" />}
                label="Generate Bundle Link"
              />
            </div>

            {bundleUrl && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      readOnly value={bundleUrl}
                      className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                      onClick={e => (e.target as HTMLInputElement).select()}
                    />
                    <CopyBtn copied={copiedBundle} onClick={handleCopyBundle} />
                  </div>

                  <LinkStatusLine status={bundleStatus} charCount={bundleUrl.length} />

                  {shortEnabled && (
                    <ShortLinkControls
                      state={shortBundleState}
                      copied={copiedShortBundle}
                      onCreate={handleCreateShortBundleLink}
                      onCopy={handleCopyShortBundle}
                    />
                  )}

                  <p className="text-[10px] text-muted-foreground/50">
                    Recipients see a list and can open each JSON in the editor.
                  </p>
                </div>
            )}
          </div>
        )}

        {/* ── Section 3: Export ── */}
        <SectionHeader
          label="Export"
          icon={<FileCode className="w-3.5 h-3.5 text-primary" />}
          open={open === "export"}
          onToggle={() => setOpen(s => s === "export" ? "link" : "export")}
        />

        {open === "export" && (
          <div className="px-4 py-4 flex flex-col gap-3 border-b border-border">
            {hasMultipleTabs && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-muted-foreground">Export</span>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="exportScope" checked={exportScope === "current"} onChange={() => setExportScope("current")} className="rounded-full" />
                    <span className="text-xs">Current tab</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="exportScope" checked={exportScope === "selected"} onChange={() => setExportScope("selected")} className="rounded-full" />
                    <span className="text-xs">Selected tabs</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="exportScope" checked={exportScope === "all"} onChange={() => setExportScope("all")} className="rounded-full" />
                    <span className="text-xs">All tabs (bundle)</span>
                  </label>
                </div>
                {(exportScope === "selected" || exportScope === "all") && exportScope === "selected" && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tabs.map((t) => (
                      <label key={t.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={selectedTabIds.has(t.id)} onChange={() => toggleTabSelection(t.id)} className="rounded" />
                        <span className="text-[11px] truncate max-w-[100px]">{t.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleHtmlExport}
              disabled={!exportHasJson}
              className="flex items-start gap-3 w-full p-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <FileCode className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">Export Interactive HTML</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Standalone file · Tree view · Search · Expand/collapse · Works offline
                </div>
              </div>
            </button>

            <button
              onClick={handleDownloadJson}
              disabled={!exportHasJson}
              className="flex items-start gap-3 w-full p-3 rounded-xl bg-secondary/40 border border-border hover:bg-secondary/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <Download className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">Download .json</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {hasMultipleTabs && exportScope !== "current" ? "Bundle JSON (all/selected tabs)" : "Raw JSON file"}
                </div>
              </div>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

/* ── Reusable sub-components ─────────────────────── */

function SectionHeader({ label, icon, open, onToggle, badge }: {
  label: string; icon: React.ReactNode;
  open: boolean; onToggle: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full px-4 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors border-b border-border select-none"
    >
      {icon}
      <span className="uppercase tracking-wider">{label}</span>
      {badge && (
        <span className="ml-1 text-[9px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-medium">
          {badge}
        </span>
      )}
      <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
    </button>
  );
}

function CopyBtn({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <AppButton
      onClick={onClick}
      className="shrink-0"
      title="Copy to clipboard"
      leftIcon={copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      label={copied ? "Copied!" : "Copy"}
      hideLabelOnMobile
    />
  );
}

function ShortLinkControls({
  state,
  copied,
  onCreate,
  onCopy,
}: {
  state: ShortState;
  copied: boolean;
  onCreate: () => void;
  onCopy: () => void;
}) {
  if (state.kind === "idle") {
    return (
      <AppButton
        onClick={onCreate}
        leftIcon={<Zap className="w-3.5 h-3.5 text-primary" />}
        label="Create short link (30-day)"
      />
    );
  }
  if (state.kind === "pending") {
    return (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Creating short link…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
        <span>{state.message}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={state.shortUrl}
          className="flex-1 min-w-0 text-[11px] font-mono bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-foreground truncate outline-none"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <CopyBtn copied={copied} onClick={onCopy} />
      </div>
      <span className="text-[10px] text-muted-foreground/60">
        Auto-deletes in {Math.round(state.expiresInSeconds / 86400)} days.
      </span>
    </div>
  );
}

function LinkStatusLine({ status, charCount }: { status: LinkStatus; charCount: number }) {
  if (status === "too-large") {
    return (
      <div className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
        <span>
          Link is long ({charCount.toLocaleString()} chars) and may exceed some browser or chat-app limits.
          Consider <strong>Export</strong> below to share a file instead.
        </span>
      </div>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <AlertTriangle className="w-3 h-3" />
        Couldn't build link. Check that your JSON is valid.
      </span>
    );
  }
  return null;
}
