"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Link2, Plus, Trash2, Copy, Check, Download,
  FileCode, Package, Lock, ChevronDown, Sparkles, X, AlertTriangle,
  Loader2, Zap,
} from "lucide-react";
import { encodeJsonAsync, encodeBundleAsync, encodeCurlShare, type BundleEntry } from "@/lib/share";
import { generateHtml } from "@/lib/html-export";
import type { TabData, CurlMeta } from "@/lib/tabs-storage";
import { TerminalSquare } from "lucide-react";
import { AppButton } from "@/components/app/AppButton";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";
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
  curlMeta?: CurlMeta;
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

export default function JsonSharePanel({ json, onDownloadJson, onClose, tabs = [], activeTabId, curlMeta }: JsonSharePanelProps) {
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
        let url: string;
        if (shareInput.kind === "bundle") {
          url = window.location.origin + "/bundle/#bundle=" + await encodeBundleAsync(shareInput.data);
        } else if (curlMeta && shareScope !== "all" && shareScope !== "selected") {
          // Encode as curl share when active tab is a curl tab and sharing current only
          const encoded = await encodeCurlShare({
            curl: curlMeta.command,
            json: shareInput.data,
            meta: {
              method: curlMeta.method,
              url: curlMeta.url,
              status: curlMeta.status,
              statusText: curlMeta.statusText,
              responseHeaders: curlMeta.responseHeaders,
              timing: curlMeta.timing,
            },
          });
          url = window.location.origin + "/#curl=" + encoded;
        } else {
          url = window.location.origin + "/#json=" + await encodeJsonAsync(shareInput.data);
        }
        if (cancelled) return;
        setShareUrl(url);
        setLinkStatus(url.length > URL_LENGTH_WARN ? "too-large" : "ok");
      } catch {
        if (!cancelled) setLinkStatus("failed");
      }
    })();

    return () => { cancelled = true; };
  }, [shareInput, curlMeta, shareScope]);

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
    if (!result.ok && result.code !== "aborted") {
      setShortLinkState({ kind: "error", message: shortErrorMessage(result) });
    }
  }, [shareUrl]);

  // Auto-create the short link once a share URL is ready, debounced so
  // typing in the editor doesn't hammer the Worker on every keystroke.
  useEffect(() => {
    shortLinkAbortRef.current?.abort();
    if (!shortEnabled || !shareUrl) {
      setShortLinkState({ kind: "idle" });
      return;
    }
    const timer = setTimeout(() => { void handleCreateShortLink(); }, 500);
    return () => clearTimeout(timer);
  }, [shareUrl, handleCreateShortLink]);

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
    if (!result.ok && result.code !== "aborted") {
      setShortBundleState({ kind: "error", message: shortErrorMessage(result) });
    }
  }, [bundleUrl]);

  useEffect(() => {
    shortBundleAbortRef.current?.abort();
    if (!shortEnabled || !bundleUrl) {
      setShortBundleState({ kind: "idle" });
      return;
    }
    const timer = setTimeout(() => { void handleCreateShortBundleLink(); }, 300);
    return () => clearTimeout(timer);
  }, [bundleUrl, handleCreateShortBundleLink]);

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
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Share &amp; Export</span>
          <InfoHelp text={MODES.share.help} label="About sharing" side="bottom" className="shrink-0" />
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

        {/* ── cURL Command (shown when active tab came from a curl) ── */}
        {curlMeta && (
          <CurlCommandSection meta={curlMeta} />
        )}

        {/* ── Section 1: Share via Link ── */}
        <SectionHeader
          label="Share via Link"
          icon={<Link2 className="w-3.5 h-3.5 text-primary" />}
          open={open === "link"}
          onToggle={() => setOpen(s => s === "link" ? "export" : "link")}
          badge={shareHasJson ? "Ready" : undefined}
          help="Builds a URL whose fragment holds your JSON (or a bundle). Recipients open the same app and decode locally. Very long payloads may need export or a short link instead."
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
                {shortEnabled && shareUrl && (
                  <ShortLinkControls
                    state={shortLinkState}
                    copied={copiedShortLink}
                    onCreate={handleCreateShortLink}
                    onCopy={handleCopyShortLink}
                  />
                )}

                {/* Long URL acts as a fallback: always shown when the shortener
                 *  isn't configured, and only revealed as a recovery path when
                 *  the shortener fails (too-large, network error, etc.). */}
                {(!shortEnabled || shortLinkState.kind === "error") && (
                  <>
                    {shortEnabled && (
                      <p className="text-[11px] text-muted-foreground">
                        Fallback — share the full link directly:
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        readOnly value={shareUrl}
                        className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                        onClick={e => (e.target as HTMLInputElement).select()}
                      />
                      <CopyBtn copied={copiedLink} onClick={handleCopyLink} />
                    </div>

                    <LinkStatusLine status={linkStatus} charCount={shareUrl.length} />
                  </>
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
          help="Combine several named JSON documents into one shareable link. The bundle page lists entries so people can open each in the editor."
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
                  {shortEnabled && (
                    <ShortLinkControls
                      state={shortBundleState}
                      copied={copiedShortBundle}
                      onCreate={handleCreateShortBundleLink}
                      onCopy={handleCopyShortBundle}
                    />
                  )}

                  {(!shortEnabled || shortBundleState.kind === "error") && (
                    <>
                      {shortEnabled && (
                        <p className="text-[11px] text-muted-foreground">
                          Fallback — share the full link directly:
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          readOnly value={bundleUrl}
                          className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                          onClick={e => (e.target as HTMLInputElement).select()}
                        />
                        <CopyBtn copied={copiedBundle} onClick={handleCopyBundle} />
                      </div>

                      <LinkStatusLine status={bundleStatus} charCount={bundleUrl.length} />
                    </>
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
          help="Download .json, a multi-tab bundle file, or a standalone HTML file that embeds your data for offline viewing."
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

function SectionHeader({ label, icon, open, onToggle, badge, help }: {
  label: string; icon: React.ReactNode;
  open: boolean; onToggle: () => void; badge?: string;
  help?: string;
}) {
  return (
    <div className="flex items-stretch border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-1 min-w-0 items-center gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors select-none text-left"
      >
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
        {badge && (
          <span className="ml-1 text-[9px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-medium">
            {badge}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      {help ? (
        <div className="flex items-center pr-3 pl-1 border-l border-border/60 bg-transparent">
          <InfoHelp text={help} label={`About ${label}`} side="left" className="self-center" />
        </div>
      ) : null}
    </div>
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
    // Auto-create fires immediately via useEffect; idle is a transient
    // state we don't need to render anything for.
    return null;
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
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
        <AppButton
          onClick={onCreate}
          leftIcon={<Zap className="w-3.5 h-3.5 text-primary" />}
          label="Try again"
        />
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

function CurlCommandSection({ meta }: { meta: CurlMeta }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(meta.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const statusColor =
    meta.status >= 500 ? "text-red-600 dark:text-red-400" :
    meta.status >= 400 ? "text-orange-600 dark:text-orange-400" :
    "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="px-4 py-3 border-b border-border bg-secondary/20">
      <div className="flex items-center gap-2 mb-2">
        <TerminalSquare className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-semibold text-foreground">cURL Request</span>
        <span className={`ml-auto text-[10px] font-medium ${statusColor}`}>
          {meta.status} {meta.statusText} · {meta.timing}ms
        </span>
      </div>
      <div className="relative">
        <pre className="text-[10px] font-mono bg-surface2 border border-border rounded-lg p-2.5 overflow-x-auto text-foreground/80 whitespace-pre-wrap break-all max-h-28">
          {meta.command}
        </pre>
        <div className="absolute top-1.5 right-1.5">
          <AppButton
            size="sm"
            onClick={handleCopy}
            className="px-2 py-0.5 text-[10px] bg-surface1/90 border border-border"
            leftIcon={copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            label={copied ? "Copied!" : "Copy"}
          />
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground/60">
        The share link encodes both this curl command and the response — recipients see the full request + JSON.
      </p>
    </div>
  );
}
