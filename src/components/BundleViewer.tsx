"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Braces, ChevronRight, ChevronDown, ExternalLink, Lock, Package } from "lucide-react";
import { decodeBundleAsync, encodeJsonAsync, type BundleEntry } from "@/lib/share";

const JsonTreeView = dynamic(() => import("@/components/JsonTreeView"), { ssr: false });

export default function BundleViewer() {
  const [entries, setEntries] = useState<BundleEntry[]>([]);
  const [parsed, setParsed] = useState<Record<number, unknown>>({});
  const [encodedUrls, setEncodedUrls] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const hash = window.location.hash.match(/^#bundle=(.+)/);
    if (!hash) {
      setErrorMsg("No bundle found in this URL. Check the link and try again.");
      setStatus("error");
      return;
    }
    let cancelled = false;
    void (async () => {
      const decoded = await decodeBundleAsync(hash[1]);
      if (cancelled) return;
      if (!decoded.length) {
        setErrorMsg("Could not decode the bundle. The link may be incomplete or corrupted.");
        setStatus("error");
        return;
      }
      const p: Record<number, unknown> = {};
      decoded.forEach((entry, i) => {
        try { p[i] = JSON.parse(entry.json); } catch {}
      });
      setEntries(decoded);
      setParsed(p);
      setStatus("ok");

      // Pre-encode each entry so "Open in Editor" can be a native
      // <a target="_blank">. Doing it up front avoids the async-inside-
      // click-handler problem where browsers consume user-activation
      // before window.open runs and silently fall back to same-tab.
      const urls: Record<number, string> = {};
      for (let i = 0; i < decoded.length; i++) {
        try {
          const encoded = await encodeJsonAsync(decoded[i].json);
          if (cancelled) return;
          const title = decoded[i].title;
          const titleParam = title ? `?name=${encodeURIComponent(title)}` : "";
          urls[i] = `/${titleParam}#json=${encoded}`;
          setEncodedUrls({ ...urls });
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openAllInNewTabs = () => {
    entries.forEach((_, i) => {
      const url = encodedUrls[i];
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  const allEncoded = entries.length > 0 && entries.every((_, i) => !!encodedUrls[i]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 bg-[hsl(var(--toolbar))] border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Braces className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">JSON Prism</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">JSON Bundle Viewer</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground bg-primary/5 border border-primary/15 rounded-full px-3 py-1.5">
          <Lock className="w-3 h-3 text-primary" />
          <span>No data stored · Runs in your browser</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 py-8">

        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Decoding bundle…
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-5">
            <p className="text-sm font-medium text-destructive mb-1">Unable to load bundle</p>
            <p className="text-xs text-destructive/70">{errorMsg}</p>
            <Link href="/" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> Open JSON Prism
            </Link>
          </div>
        )}

        {status === "ok" && (
          <>
            {/* Bundle summary */}
            <div className="mb-6 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-primary" />
                  <h1 className="text-lg font-semibold">JSON Bundle</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {entries.length} JSON{entries.length !== 1 ? "s" : ""} shared — click an entry to view it
                </p>
              </div>
              {entries.length > 1 && (
                <button
                  onClick={openAllInNewTabs}
                  disabled={!allEncoded}
                  className="shrink-0 flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={allEncoded ? "Open every entry in a new tab" : "Preparing links…"}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open all in new tabs
                </button>
              )}
            </div>

            {/* Entry list */}
            <div className="flex flex-col gap-3">
              {entries.map((entry, i) => {
                const isOpen = selected === i;
                const isValid = parsed[i] !== undefined;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-border overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Entry header */}
                    <button
                      onClick={() => setSelected(isOpen ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/30 transition-colors text-left"
                    >
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-primary shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="font-medium text-sm flex-1 truncate">
                        {entry.title || `Entry ${i + 1}`}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                        isValid
                          ? "text-primary bg-primary/10 border-primary/20"
                          : "text-destructive bg-destructive/10 border-destructive/20"
                      }`}>
                        {isValid ? "Valid JSON" : "Invalid"}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {entry.json.length.toLocaleString()} chars
                      </span>
                    </button>

                    {/* Entry content */}
                    {isOpen && (
                      <div className="border-t border-border">
                        {/* Sub-toolbar */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-[hsl(var(--pane-header))] border-b border-border">
                          <span className="text-[11px] text-muted-foreground flex-1">
                            {isValid
                              ? Array.isArray(parsed[i])
                                ? `Array · ${(parsed[i] as unknown[]).length} items`
                                : `Object · ${Object.keys(parsed[i] as object).length} keys`
                              : "Could not parse JSON"}
                          </span>
                          <a
                            href={encodedUrls[i] ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-disabled={!encodedUrls[i]}
                            onClick={(e) => { if (!encodedUrls[i]) e.preventDefault(); }}
                            className={`flex items-center gap-1 text-[11px] text-primary hover:underline ${!encodedUrls[i] ? "opacity-50 cursor-not-allowed" : ""}`}
                            title={encodedUrls[i] ? "Open in JSON Prism editor" : "Preparing link…"}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open in Editor
                          </a>
                        </div>

                        {/* Tree or fallback */}
                        <div className="p-4 max-h-[480px] overflow-auto bg-[hsl(var(--surface))]">
                          {isValid ? (
                            <JsonTreeView
                              data={parsed[i]}
                              expandAll={undefined}
                              searchTerm={undefined}
                            />
                          ) : (
                            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
                              {entry.json}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="text-center text-[11px] text-muted-foreground py-5 border-t border-border">
        Shared via{" "}
        <Link href="/" className="text-primary hover:underline">JSON Prism</Link>
        {" "}· Your data never leaves your browser · No accounts · No tracking
      </footer>
    </div>
  );
}
