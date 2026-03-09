"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Link2, Plus, Trash2, Copy, Check, Download,
  FileCode, Package, Lock, ChevronDown, Sparkles, Zap, Loader2, X,
} from "lucide-react";
import { encodeJson, encodeBundle, type BundleEntry } from "@/lib/share";
import { generateHtml } from "@/lib/html-export";
import type { TabData } from "@/lib/tabs-storage";

interface JsonSharePanelProps {
  json: string;
  onDownloadJson: (json?: string, filename?: string) => void;
  onClose?: () => void;
  tabs?: TabData[];
  activeTabId?: string;
}

type Section = "link" | "bundle" | "export";

/** Shorten any URL via is.gd public CORS API — handles URL fragments correctly */
async function shortenUrl(longUrl: string): Promise<string> {
  const res = await fetch(
    `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.errorcode) throw new Error(data.errormessage ?? "Shortening failed");
  return data.shorturl as string;
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

  const getShareJson = (): string => {
    if (!hasMultipleTabs || shareScope === "current") return json;
    const ids = shareScope === "all" ? tabs.map((t) => t.id) : Array.from(selectedTabIds);
    const entries = tabs.filter((t) => ids.includes(t.id)).map((t) => ({ title: t.name, json: t.json }));
    return JSON.stringify(entries);
  };

  const getShareUrl = (): string => {
    const toShare = getShareJson();
    if (!toShare.trim()) return "";
    if (hasMultipleTabs && shareScope !== "current") {
      try {
        const entries = JSON.parse(toShare) as BundleEntry[];
        const encoded = encodeBundle(entries);
        return window.location.origin + "/bundle/#bundle=" + encoded;
      } catch {
        return "";
      }
    }
    const encoded = encodeJson(toShare);
    return window.location.origin + "/#json=" + encoded;
  };

  const toggleTabSelection = (id: string) => {
    setSelectedTabIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Share via Link ─────────────────────────────── */
  const [shareUrl, setShareUrl]         = useState("");
  const [shortLinkUrl, setShortLinkUrl] = useState("");
  const [copiedLink, setCopiedLink]     = useState(false);
  const [shorteningLink, setShorteningLink] = useState(false);

  const shareUrlComputed = getShareUrl();
  const shareHasJson = (() => {
    if (!hasMultipleTabs || shareScope === "current") return !!json.trim();
    if (shareScope === "all") return tabs.some((t) => t.json.trim());
    return tabs.some((t) => selectedTabIds.has(t.id) && t.json.trim());
  })();

  useEffect(() => {
    if (!shareHasJson) { setShareUrl(""); return; }
    const computed = shareUrlComputed;
    setShareUrl(computed);
    setShortLinkUrl("");
    setShorteningLink(true);
    shortenUrl(computed)
      .then(setShortLinkUrl)
      .catch(() => {})
      .finally(() => setShorteningLink(false));
  }, [shareUrlComputed, shareHasJson]);

  const displayLinkUrl = shortLinkUrl || shareUrl;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1600);
  };

  /* ── Bundle ─────────────────────────────────────── */
  const [bundleEntries, setBundleEntries] = useState<BundleEntry[]>([{ title: "My JSON", json: "" }]);

  const useAllTabsAsBundle = useCallback(() => {
    const entries = tabs.filter((t) => t.json.trim()).map((t) => ({ title: t.name, json: t.json }));
    if (entries.length) setBundleEntries(entries);
  }, [tabs]);
  const [bundleUrl, setBundleUrl]             = useState("");
  const [shortBundleUrl, setShortBundleUrl]   = useState("");
  const [copiedBundle, setCopiedBundle]       = useState(false);
  const [shorteningBundle, setShorteningBundle] = useState(false);

  const generateBundleUrl = useCallback(() => {
    const valid = bundleEntries.filter(e => e.title.trim() && e.json.trim());
    if (!valid.length) return;
    const encoded = encodeBundle(valid);
    const url = window.location.origin + "/bundle/#bundle=" + encoded;
    setShortBundleUrl("");
    setBundleUrl(url);
    setShorteningBundle(true);
    shortenUrl(url)
      .then(setShortBundleUrl)
      .catch(() => {})
      .finally(() => setShorteningBundle(false));
  }, [bundleEntries]);

  const displayBundleUrl = shortBundleUrl || bundleUrl;
  const handleCopyBundle = () => {
    navigator.clipboard.writeText(displayBundleUrl);
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 1600);
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
          <strong className="text-foreground font-medium">We do not store your data.</strong>{" "}
          Everything runs in your browser — no servers, no tracking, no accounts.
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
                    readOnly value={displayLinkUrl}
                    className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                    onClick={e => (e.target as HTMLInputElement).select()}
                  />
                  <CopyBtn copied={copiedLink} onClick={handleCopyLink} />
                </div>

                {/* Shorten status */}
                <div className="flex items-center gap-2">
                  {shorteningLink ? (
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating short link…
                    </span>
                  ) : shortLinkUrl ? (
                    <span className="flex items-center gap-1.5 text-[11px] text-primary">
                      <Zap className="w-3 h-3" />
                      Shortened via is.gd
                      <button
                        onClick={() => { setShortLinkUrl(""); setLinkShortenErr(""); }}
                        className="ml-1 text-muted-foreground hover:text-foreground underline text-[10px]"
                      >
                        use full link
                      </button>
                    </span>
                  ) : null}
                </div>
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
              <button onClick={addEntry} className="toolbar-btn text-muted-foreground">
                <Plus className="w-3.5 h-3.5" /><span>Add JSON</span>
              </button>
              {hasMultipleTabs && (
                <button onClick={useAllTabsAsBundle} className="toolbar-btn text-primary">
                  <Package className="w-3.5 h-3.5" /><span>Use all tabs</span>
                </button>
              )}
              <button onClick={generateBundleUrl} className="toolbar-btn ml-auto">
                <Package className="w-3.5 h-3.5 text-primary" /><span>Generate Bundle Link</span>
              </button>
            </div>

            {bundleUrl && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      readOnly value={displayBundleUrl}
                      className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                      onClick={e => (e.target as HTMLInputElement).select()}
                    />
                    <CopyBtn copied={copiedBundle} onClick={handleCopyBundle} />
                  </div>

                  {/* Shorten bundle status */}
                  <div className="flex items-center gap-2">
                    {shorteningBundle ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating short link…
                      </span>
                    ) : shortBundleUrl ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-primary">
                        <Zap className="w-3 h-3" />
                        Shortened via is.gd
                        <button
                          onClick={() => { setShortBundleUrl(""); setBundleShortenErr(""); }}
                          className="ml-1 text-muted-foreground hover:text-foreground underline text-[10px]"
                        >
                          use full link
                        </button>
                      </span>
                    ) : null}
                  </div>

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
    <button onClick={onClick} className="toolbar-btn shrink-0" title="Copy to clipboard">
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
