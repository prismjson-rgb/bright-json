"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Link2, Plus, Trash2, Copy, Check, Download,
  FileCode, Package, Lock, ChevronDown, AlertTriangle, Sparkles, Zap, Loader2,
} from "lucide-react";
import { encodeJson, encodeBundle, isTooLarge, type BundleEntry } from "@/lib/share";
import { generateHtml } from "@/lib/html-export";

interface JsonSharePanelProps {
  json: string;
  onDownloadJson: () => void;
}

type Section = "link" | "bundle" | "export";

/** Shorten any URL via is.gd public CORS API — no API key required */
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

export default function JsonSharePanel({ json, onDownloadJson }: JsonSharePanelProps) {
  const [open, setOpen] = useState<Section>("link");

  /* ── Share via Link ─────────────────────────────── */
  const [shareUrl, setShareUrl]         = useState("");
  const [shortLinkUrl, setShortLinkUrl] = useState("");
  const [urlTooLarge, setUrlTooLarge]   = useState(false);
  const [copiedLink, setCopiedLink]     = useState(false);
  const [shorteningLink, setShorteningLink] = useState(false);
  const [linkShortenErr, setLinkShortenErr] = useState("");

  useEffect(() => {
    if (!json.trim()) { setShareUrl(""); setUrlTooLarge(false); return; }
    const encoded = encodeJson(json);
    const url = window.location.origin + "/#json=" + encoded;
    setShareUrl(url);
    setUrlTooLarge(isTooLarge(url));
    // Reset short link when JSON changes
    setShortLinkUrl("");
    setLinkShortenErr("");
  }, [json]);

  const handleShortenLink = async () => {
    setShorteningLink(true);
    setLinkShortenErr("");
    try {
      const short = await shortenUrl(shareUrl);
      setShortLinkUrl(short);
    } catch (e) {
      setLinkShortenErr("Shortening failed — try again or copy the full link.");
      console.error(e);
    } finally {
      setShorteningLink(false);
    }
  };

  const displayLinkUrl = shortLinkUrl || shareUrl;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1600);
  };

  /* ── Bundle ─────────────────────────────────────── */
  const [bundleEntries, setBundleEntries]     = useState<BundleEntry[]>([{ title: "My JSON", json: "" }]);
  const [bundleUrl, setBundleUrl]             = useState("");
  const [shortBundleUrl, setShortBundleUrl]   = useState("");
  const [bundleTooLarge, setBundleTooLarge]   = useState(false);
  const [copiedBundle, setCopiedBundle]       = useState(false);
  const [shorteningBundle, setShorteningBundle] = useState(false);
  const [bundleShortenErr, setBundleShortenErr] = useState("");

  const generateBundleUrl = useCallback(() => {
    const valid = bundleEntries.filter(e => e.title.trim() && e.json.trim());
    if (!valid.length) return;
    const encoded = encodeBundle(valid);
    const url = window.location.origin + "/bundle/#bundle=" + encoded;
    setBundleUrl(url);
    setBundleTooLarge(isTooLarge(url));
    setShortBundleUrl("");
    setBundleShortenErr("");
  }, [bundleEntries]);

  const handleShortenBundle = async () => {
    setShorteningBundle(true);
    setBundleShortenErr("");
    try {
      const short = await shortenUrl(bundleUrl);
      setShortBundleUrl(short);
    } catch (e) {
      setBundleShortenErr("Shortening failed — try again or copy the full link.");
      console.error(e);
    } finally {
      setShorteningBundle(false);
    }
  };

  const displayBundleUrl = shortBundleUrl || bundleUrl;
  const handleCopyBundle = () => {
    navigator.clipboard.writeText(displayBundleUrl);
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 1600);
  };

  const addEntry    = () => setBundleEntries(e => [...e, { title: `Entry ${e.length + 1}`, json: "" }]);
  const removeEntry = (idx: number) => setBundleEntries(e => e.filter((_, i) => i !== idx));
  const updateEntry = (idx: number, field: keyof BundleEntry, value: string) =>
    setBundleEntries(e => e.map((ent, i) => i === idx ? { ...ent, [field]: value } : ent));
  const applyCurrentJson = (idx: number) => updateEntry(idx, "json", json);

  /* ── HTML Export ─────────────────────────────────── */
  const handleHtmlExport = () => {
    const html = generateHtml(json);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "json-export.html" }).click();
    URL.revokeObjectURL(url);
  };

  const hasJson = !!json.trim();
  const compressionRatio = hasJson
    ? Math.round((1 - encodeJson(json).length / json.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="pane-header">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span>Share &amp; Export</span>
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
          badge={hasJson && !urlTooLarge ? "Ready" : undefined}
        />

        {open === "link" && (
          <div className="px-4 py-4 flex flex-col gap-3 border-b border-border">
            {!hasJson ? (
              <p className="text-xs text-muted-foreground">Paste JSON in the editor first.</p>
            ) : urlTooLarge ? (
              <WarningBox
                title="JSON too large for a URL"
                body="Your JSON exceeds the safe browser URL limit (~2 KB). Use HTML Export below to share as a file."
              />
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

                {/* Shorten row */}
                <div className="flex items-center gap-2">
                  {!shortLinkUrl ? (
                    <button
                      onClick={handleShortenLink}
                      disabled={shorteningLink}
                      className="toolbar-btn text-primary disabled:opacity-50"
                      title="Get a short link via is.gd"
                    >
                      {shorteningLink
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Zap className="w-3.5 h-3.5" />}
                      <span>{shorteningLink ? "Shortening…" : "Shorten Link"}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] text-primary">
                      <Check className="w-3 h-3" />
                      Shortened via is.gd
                      <button
                        onClick={() => { setShortLinkUrl(""); setLinkShortenErr(""); }}
                        className="ml-1 text-muted-foreground hover:text-foreground underline text-[10px]"
                      >
                        use full link
                      </button>
                    </span>
                  )}
                  {linkShortenErr && (
                    <span className="text-[11px] text-destructive">{linkShortenErr}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground/50">
                  <span>{shareUrl.length.toLocaleString()} chars (compressed)</span>
                  <span>·</span>
                  <span className="text-primary/70">{compressionRatio}% smaller than raw JSON</span>
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
          badge={bundleUrl && !bundleTooLarge ? "Ready" : undefined}
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

            <div className="flex items-center gap-2">
              <button onClick={addEntry} className="toolbar-btn text-muted-foreground">
                <Plus className="w-3.5 h-3.5" /><span>Add JSON</span>
              </button>
              <button onClick={generateBundleUrl} className="toolbar-btn ml-auto">
                <Package className="w-3.5 h-3.5 text-primary" /><span>Generate Bundle Link</span>
              </button>
            </div>

            {bundleUrl && (
              bundleTooLarge ? (
                <WarningBox title="Bundle too large for a URL" body="Try fewer entries or smaller JSONs." />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      readOnly value={displayBundleUrl}
                      className="flex-1 min-w-0 text-[11px] font-mono bg-secondary/50 border border-border rounded-lg px-3 py-2 text-muted-foreground truncate outline-none"
                      onClick={e => (e.target as HTMLInputElement).select()}
                    />
                    <CopyBtn copied={copiedBundle} onClick={handleCopyBundle} />
                  </div>

                  {/* Shorten bundle */}
                  <div className="flex items-center gap-2">
                    {!shortBundleUrl ? (
                      <button
                        onClick={handleShortenBundle}
                        disabled={shorteningBundle}
                        className="toolbar-btn text-primary disabled:opacity-50"
                      >
                        {shorteningBundle
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Zap className="w-3.5 h-3.5" />}
                        <span>{shorteningBundle ? "Shortening…" : "Shorten Link"}</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-primary">
                        <Check className="w-3 h-3" />
                        Shortened via is.gd
                        <button
                          onClick={() => { setShortBundleUrl(""); setBundleShortenErr(""); }}
                          className="ml-1 text-muted-foreground hover:text-foreground underline text-[10px]"
                        >
                          use full link
                        </button>
                      </span>
                    )}
                    {bundleShortenErr && (
                      <span className="text-[11px] text-destructive">{bundleShortenErr}</span>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground/50">
                    Recipients see a list and can open each JSON in the editor.
                  </p>
                </div>
              )
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
          <div className="px-4 py-4 flex flex-col gap-2 border-b border-border">
            <button
              onClick={handleHtmlExport}
              disabled={!hasJson}
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
              onClick={onDownloadJson}
              disabled={!hasJson}
              className="flex items-start gap-3 w-full p-3 rounded-xl bg-secondary/40 border border-border hover:bg-secondary/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <Download className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">Download .json</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Raw JSON file</div>
              </div>
            </button>

            {urlTooLarge && hasJson && (
              <p className="text-[11px] text-primary/80 mt-1">
                💡 JSON too large for a URL — HTML Export is the best way to share it.
              </p>
            )}
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

function WarningBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-2.5 p-3 rounded-xl bg-destructive/8 border border-destructive/25">
      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-destructive">{title}</p>
        <p className="text-[11px] text-destructive/70 mt-0.5">{body}</p>
      </div>
    </div>
  );
}
