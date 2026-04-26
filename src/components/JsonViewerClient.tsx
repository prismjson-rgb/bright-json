"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronsDownUp, ChevronsUpDown, Copy, Check,
  Minimize2, ArrowUpDown, Sparkles, Save, Trash2, Wrench, Upload, MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonSearch } from "@/hooks/useJsonSearch";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import JsonEditor from "@/components/JsonEditor";
import JsonTabBar from "@/components/JsonTabBar";
import OverlaySidebar from "@/components/OverlaySidebar";
import AppHeader from "@/components/app/AppHeader";
import LeftRail from "@/components/app/LeftRail";
import MobileHeader from "@/components/app/MobileHeader";
import { AppButton } from "@/components/app/AppButton";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES, getModeLayout, type PanelMode } from "@/lib/modes";

const panelLoading = () => (
  <div className="flex items-center justify-center flex-1 min-h-[200px] text-muted-foreground text-sm">
    Loading…
  </div>
);

const JsonTreeView = dynamic(() => import("@/components/JsonTreeView"), { ssr: false, loading: panelLoading });
const JsonVisualEditor = dynamic(() => import("@/components/JsonVisualEditor"), { ssr: false, loading: panelLoading });
const JsonDiffViewer = dynamic(() => import("@/components/JsonDiffViewer"), { ssr: false, loading: panelLoading });
const JsonConvertPanel = dynamic(() => import("@/components/JsonConvertPanel"), { ssr: false, loading: panelLoading });
const JsonSearchPanel = dynamic(() => import("@/components/JsonSearchPanel"), { ssr: false, loading: panelLoading });
const JsonNoteEditor = dynamic(() => import("@/components/JsonNoteEditor"), { ssr: false, loading: panelLoading });
const JsonMockGenerator = dynamic(() => import("@/components/JsonMockGenerator"), { ssr: false, loading: panelLoading });
const JsonDebugger = dynamic(() => import("@/components/JsonDebugger"), { ssr: false, loading: panelLoading });
const JsonTrimmer = dynamic(() => import("@/components/JsonTrimmer"), { ssr: false, loading: panelLoading });
const JsonAiCleaner = dynamic(() => import("@/components/JsonAiCleaner"), { ssr: false, loading: panelLoading });
const JsonMinimalMode = dynamic(() => import("@/components/JsonMinimalMode"), { ssr: false, loading: panelLoading });
const JsonStructureAnalyzer = dynamic(() => import("@/components/JsonStructureAnalyzer"), { ssr: false, loading: panelLoading });
const JsonBestPractices = dynamic(() => import("@/components/JsonBestPractices"), { ssr: false, loading: panelLoading });
const JsonTokenEstimator = dynamic(() => import("@/components/JsonTokenEstimator"), { ssr: false, loading: panelLoading });
const JsonLearnPanel = dynamic(() => import("@/components/JsonLearnPanel"), { ssr: false, loading: panelLoading });
const JsonSharePanel = dynamic(() => import("@/components/JsonSharePanel"), { ssr: false, loading: panelLoading });
const SettingsPanel = dynamic(() => import("@/components/SettingsPanel"), { ssr: false, loading: panelLoading });
const JsonFlowView = dynamic(() => import("@/components/JsonFlowView"), { ssr: false, loading: panelLoading });
import { useSettings } from "@/contexts/SettingsContext";
import { repairJson } from "@/lib/json-debug";
import { safeDecodeJsonAsync, decodeCurlShare } from "@/lib/share";
import { saveJson, hasSavedJson, clearSavedJson } from "@/lib/saved-json";
import { parseCurl, executeCurl, labelFromCurlRequest } from "@/lib/curl-executor";
import { getToolLaunchConfig, type ToolLaunchConfig } from "@/lib/tool-links";
import {
  loadTabs,
  saveTabs,
  createTab,
  getNextTabName,
  defaultTabs,
  type TabsState,
  type CurlMeta,
} from "@/lib/tabs-storage";
import CurlPanel from "@/components/CurlPanel";
import CurlMetaBar from "@/components/CurlMetaBar";

// Re-exported so older imports continue to resolve; canonical source is @/lib/modes.
export type { PanelMode } from "@/lib/modes";

function getInitialTabs(): TabsState {
  const tabs = defaultTabs();
  return { tabs, activeId: tabs[0].id };
}

/** Debounce tab persistence so we do not stringify/write multi‑MB JSON on every keystroke. */
const TABS_SAVE_DEBOUNCE_MS = 400;

function isJsonLikeFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json") || name.endsWith(".txt")) return true;
  const t = file.type;
  return t === "application/json" || t === "text/plain";
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsText(file);
  });
}

export default function JsonViewerClient() {
  const [tabsState, setTabsState] = useState<TabsState>(getInitialTabs);
  const [tabsHydrated, setTabsHydrated] = useState(false);
  const tabsStateRef = useRef(tabsState);
  tabsStateRef.current = tabsState;
  const activeTab = tabsState.tabs.find((t) => t.id === tabsState.activeId) ?? tabsState.tabs[0];
  const json = activeTab?.json ?? "";

  const syncTabJson = useCallback((value: string) => {
    setTabsState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === prev.activeId ? { ...t, json: value } : t)),
    }));
  }, []);

  const { setJson: setParserJson, parsed, error, format, minify, sortKeys } = useJsonParser(json, syncTabJson);
  const { dark, toggle } = useTheme();
  const { settings } = useSettings();
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<PanelMode>("tree");
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [launchConfig, setLaunchConfig] = useState<ToolLaunchConfig | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [curlOpen, setCurlOpen] = useState(false);
  const [curlCommand, setCurlCommand] = useState<string | undefined>(undefined);

  const { query, setQuery, matchCount, currentMatchIndex, currentMatch, nextMatch, prevMatch } = useJsonSearch(parsed);

  const setJson = useCallback(
    (value: string) => {
      setTabsState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) => (t.id === prev.activeId ? { ...t, json: value } : t)),
      }));
      setParserJson(value);
    },
    [setParserJson]
  );

  const handleRepairJson = useCallback(() => {
    if (!json.trim()) return;
    try {
      const fixed = repairJson(json);
      const obj = JSON.parse(fixed);
      const indent = settings.format.beautifyIndent;
      const out = JSON.stringify(obj, null, indent);
      setJson(out);
      toast.success("JSON repaired");
    } catch {
      toast.error("Could not repair JSON — structure may need manual edits");
    }
  }, [json, setJson, settings.format.beautifyIndent]);

  // Sync parser when switching tabs (not on json edit — only when activeId changes)
  useEffect(() => {
    setParserJson(activeTab?.json ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsState.activeId]);

  // Load persisted tabs from IndexedDB (async); avoid saving defaults before hydration completes
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadTabs();
      if (!cancelled) {
        if (loaded) setTabsState(loaded);
        setTabsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tool = params.get("tool");
    if (!tool) return;

    const config = getToolLaunchConfig(tool);
    if (!config) return;

    setLaunchConfig(config);
    if (config.mode) setMode(config.mode);
    if (config.opensShare) setShareOpen(true);
  }, []);

  // Debounced persist — avoids blocking the main thread on every keystroke
  useEffect(() => {
    if (!tabsHydrated) return;
    const id = window.setTimeout(() => {
      void saveTabs(tabsState);
    }, TABS_SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [tabsState, tabsHydrated]);

  // Flush latest tabs when leaving or hiding the tab (debounce may not have run yet)
  useEffect(() => {
    const flush = () => {
      if (!tabsHydrated) return;
      void saveTabs(tabsStateRef.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tabsHydrated]);

  // Load from URL hash after storage hydrate so hash wins over restored tabs
  useEffect(() => {
    if (!tabsHydrated) return;
    const hash = window.location.hash;

    const jsonMatch = hash.match(/^#json=(.+)/);
    if (jsonMatch) {
      let cancelled = false;
      void safeDecodeJsonAsync(jsonMatch[1]).then((decoded) => {
        if (!cancelled && decoded) setJson(decoded);
      });
      return () => { cancelled = true; };
    }

    const curlMatch = hash.match(/^#curl=(.+)/);
    if (curlMatch) {
      let cancelled = false;
      void decodeCurlShare(curlMatch[1]).then((payload) => {
        if (cancelled || !payload) return;
        const meta: CurlMeta = {
          command: payload.curl,
          method: payload.meta.method,
          url: payload.meta.url,
          status: payload.meta.status,
          statusText: payload.meta.statusText,
          responseHeaders: payload.meta.responseHeaders,
          timing: payload.meta.timing,
        };
        const label = labelFromCurlRequest({ url: meta.url, method: meta.method });
        const tab = { id: crypto.randomUUID(), name: label, json: payload.json, curlMeta: meta };
        setTabsState((prev) => ({ tabs: [...prev.tabs, tab], activeId: tab.id }));
        setParserJson(payload.json);
      });
      return () => { cancelled = true; };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsHydrated]);

  useEffect(() => {
    void hasSavedJson().then(setHasSaved);
  }, []);

  const addTab = useCallback(() => {
    const newTab = createTab(getNextTabName(tabsState.tabs));
    setTabsState((prev) => ({
      tabs: [...prev.tabs, newTab],
      activeId: newTab.id,
    }));
  }, [tabsState.tabs]);

  const closeTab = useCallback(
    (id: string) => {
      const idx = tabsState.tabs.findIndex((t) => t.id === id);
      if (idx < 0) return;
      const nextTabs = tabsState.tabs.filter((t) => t.id !== id);
      if (nextTabs.length === 0) return;
      let nextActive = tabsState.activeId;
      if (tabsState.activeId === id) {
        nextActive = nextTabs[Math.min(idx, nextTabs.length - 1)]?.id ?? nextTabs[0].id;
      }
      setTabsState({ tabs: nextTabs, activeId: nextActive });
    },
    [tabsState]
  );

  const switchTab = useCallback((id: string) => {
    setTabsState((prev) => ({ ...prev, activeId: id }));
  }, []);

  const renameTab = useCallback((id: string, name: string) => {
    const trimmed = name.trim() || "Untitled";
    setTabsState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
    }));
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [json]);

  const handleDownload = useCallback((content?: string, filename = "data.json") => {
    const toDownload = content ?? json;
    if (!toDownload.trim()) return;
    const blob = new Blob([toDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [json]);

  const importJsonTextItems = useCallback(
    (items: { content: string; filename?: string }[]) => {
      if (!items.length) return;
      const normalized = items.map(({ content, filename }) => {
        let parsed = content;
        try {
          parsed = JSON.stringify(JSON.parse(content), null, 2);
        } catch {
          /* keep raw so user can fix in editor */
        }
        return { parsed, filename };
      });
      const lastParsed = normalized[normalized.length - 1].parsed;
      setTabsState((prev) => {
        let tabs = prev.tabs;
        let activeId = prev.activeId;
        for (const { parsed, filename } of normalized) {
          const newTab = createTab(filename?.replace(/\.json$/i, "") || "Imported");
          newTab.json = parsed;
          tabs = [...tabs, newTab];
          activeId = newTab.id;
        }
        return { tabs, activeId };
      });
      setParserJson(lastParsed);
    },
    [setParserJson]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const list = Array.from(files);
      const picked = list.filter(isJsonLikeFile);
      const toRead = picked.length ? picked : list.length === 1 ? list : [];
      if (!toRead.length) {
        toast.error("Choose .json or .txt files");
        e.target.value = "";
        return;
      }
      try {
        const items = await Promise.all(
          toRead.map(async (file) => ({
            content: await readFileAsText(file),
            filename: file.name,
          }))
        );
        importJsonTextItems(items);
      } catch {
        toast.error("Could not read file");
      }
      e.target.value = "";
    },
    [importJsonTextItems]
  );

  const onEditorDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setFileDragOver(true);
  }, []);

  const onEditorDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setFileDragOver(false);
  }, []);

  /** Capture phase so file drops work over Monaco (which otherwise consumes drag/drop). */
  const onEditorDragOverCapture = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onEditorDropCapture = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      setFileDragOver(false);
      const raw = Array.from(e.dataTransfer.files ?? []);
      const jsonLike = raw.filter(isJsonLikeFile);
      const toImport = jsonLike.length ? jsonLike : raw.length === 1 ? raw : [];
      if (!toImport.length) {
        toast.error("Drop one or more .json or .txt files");
        return;
      }
      try {
        const items = await Promise.all(
          toImport.map(async (file) => ({
            content: await readFileAsText(file),
            filename: file.name,
          }))
        );
        importJsonTextItems(items);
        toast.success(toImport.length === 1 ? "File imported" : `${toImport.length} files imported`);
      } catch {
        toast.error("Could not read dropped file");
      }
    },
    [importJsonTextItems]
  );

  /** CurlPanel calls this. Parses the command, runs it, creates a new tab with curlMeta. */
  const executeCurlCommand = useCallback(
    async (command: string, signal: AbortSignal): Promise<boolean> => {
      try {
        const req = parseCurl(command);
        const res = await executeCurl(req, signal);
        const meta: CurlMeta = {
          command,
          method: req.method,
          url: req.url,
          status: res.status,
          statusText: res.statusText,
          responseHeaders: res.headers,
          timing: res.timing,
        };
        const label = labelFromCurlRequest(req);
        const tab = { id: crypto.randomUUID(), name: label, json: res.body, curlMeta: meta };
        setTabsState((prev) => ({ tabs: [...prev.tabs, tab], activeId: tab.id }));
        setParserJson(res.body);
        toast.success(`${res.status} ${res.statusText} · ${res.timing}ms`);
        return true;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return false;
        const msg = e instanceof Error ? e.message : "Request failed";
        const isNetwork =
          e instanceof TypeError ||
          /failed to fetch/i.test(msg) ||
          /networkerror/i.test(msg) ||
          msg === "Load failed";
        toast.error(
          isNetwork
            ? "Could not reach URL. Check the address, HTTPS, and CORS (the server must allow this site)."
            : msg,
        );
        return false;
      }
    },
    [setParserJson],
  );

  const handleSave = useCallback(() => {
    void (async () => {
      if (await saveJson(json)) {
        setSaved(true);
        setHasSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    })();
  }, [json]);

  const handleClearSaved = useCallback(() => {
    void clearSavedJson().then(() => setHasSaved(false));
  }, []);

  // Single mode-selection handler: routes "share" to the overlay, closes mobile
  // sheet, and clears search unless the new mode supports it.
  const handleModeSelect = useCallback((m: PanelMode) => {
    if (m === "share") {
      setShareOpen(true);
      if (isMobile) setMobileMenuOpen(false);
      return;
    }
    setMode(m);
    if (m !== "tree" && m !== "visual") setSearchOpen(false);
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const handleSearchToggle = useCallback(() => {
    // Search only renders in tree/visual modes, so jump there if needed.
    if (!(mode === "tree" || mode === "visual")) setMode("tree");
    setSearchOpen((s) => !s);
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile, mode]);

  const handleShareClick = useCallback(() => {
    setShareOpen(true);
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const handleSettingsClick = useCallback(() => {
    setSettingsOpen(true);
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") {
        if (shareOpen) { setShareOpen(false); return; }
        if (settingsOpen) { setSettingsOpen(false); return; }
        if (mode !== "tree" && mode !== "visual") { setMode("tree"); setSearchOpen(false); }
        else if (searchOpen) { setSearchOpen(false); setQuery(""); }
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setMode("tree");
        setSearchOpen(true);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); format({ indent: settings.format.beautifyIndent, sortKeys: settings.format.sortKeysOnBeautify });
      } else if (mod && e.key.toLowerCase() === "m") {
        e.preventDefault(); minify();
      } else if (mod && e.key.toLowerCase() === "l") {
        e.preventDefault(); toggle();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault(); setMode(m => m === "diff" ? "tree" : "diff");
      } else if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMode("tree");
        setSearchOpen(s => !s);
      } else if (mod && e.key.toLowerCase() === "t") {
        e.preventDefault();
        addTab();
      } else if (mod && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (tabsState.tabs.length > 1) closeTab(tabsState.activeId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, searchOpen, shareOpen, settingsOpen, format, minify, toggle, setQuery, settings.format.beautifyIndent, settings.format.sortKeysOnBeautify, addTab, closeTab, tabsState.tabs.length, tabsState.activeId]);

  const lineCount = json.split("\n").length;
  const modeCfg = MODES[mode];
  const layout = getModeLayout(mode);

  const handleUseJson = useCallback((j: string) => {
    setJson(j);
    setMode("tree");
  }, [setJson]);

  const hasJson = !!json.trim();

  // Status bar label mirrors the current overlay/mode context.
  const statusLabel = shareOpen
    ? "Share & Export"
    : settingsOpen
    ? "Settings"
    : mode === "tree"
    ? null
    : modeCfg.label;

  const railProps = {
    mode,
    onModeChange: handleModeSelect,
    hasJson,
    onImport: () => fileRef.current?.click(),
    onExport: () => handleDownload(),
    onOpenCurl: () => { setCurlCommand(undefined); setCurlOpen(true); },
  };

  const headerProps = {
    mode,
    onModeChange: handleModeSelect,
    dark,
    onToggleTheme: toggle,
    onOpenShare: handleShareClick,
    onOpenSettings: handleSettingsClick,
    searchOpen,
    onSearchToggle: handleSearchToggle,
    shareActive: shareOpen,
    settingsActive: settingsOpen,
    hasJson,
    railCollapsed,
    onToggleRail: () => setRailCollapsed((c) => !c),
  };

  return (
    <div className="flex flex-col h-screen bg-bg">
      <div className="hidden md:contents">
        <AppHeader {...headerProps} />
      </div>

      <div className="flex flex-1 min-h-0 bg-grad-hero bg-bg">
        <div className="hidden md:contents">
          {!railCollapsed && <LeftRail {...railProps} collapsed={false} />}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[min(100vw-2rem,16rem)] min-w-[11rem] p-0 gap-0 border-r border-border bg-surface1 overflow-hidden [&>button]:hidden">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <LeftRail {...railProps} onClose={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {layout === "focused" && mode === "diff" && (
          <main className="flex flex-1 min-h-0 flex-col min-w-0">
            <div className="md:hidden">
              <MobileHeader
                mode={mode}
                onOpenMenu={() => setMobileMenuOpen(true)}
                onOpenShare={handleShareClick}
                onOpenSettings={handleSettingsClick}
                searchOpen={searchOpen}
                onSearchToggle={handleSearchToggle}
                shareActive={shareOpen}
                settingsActive={settingsOpen}
                hasJson={hasJson}
              />
            </div>
            <div className="pane-header">
              <span className="inline-flex items-center gap-1">
                Diff Viewer
                <InfoHelp text={MODES.diff.help} label="About Diff Viewer" side="bottom" />
              </span>
              <span className="text-[10px] font-normal normal-case tracking-normal opacity-50 ml-3">Left = current editor · Right = paste to compare</span>
              <button onClick={() => setMode("tree")} className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted/60 hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors duration-150" title="Exit (Esc)">&times; Exit · Esc</button>
            </div>
            <JsonDiffViewer dark={dark} originalJson={json} editorSettings={settings.editor} />
          </main>
        )}

        {layout === "focused" && mode === "clean" && (
          <main className="flex flex-1 min-h-0 flex-col min-w-0">
            <div className="md:hidden">
              <MobileHeader
                mode={mode}
                onOpenMenu={() => setMobileMenuOpen(true)}
                onOpenShare={handleShareClick}
                onOpenSettings={handleSettingsClick}
                searchOpen={searchOpen}
                onSearchToggle={handleSearchToggle}
                shareActive={shareOpen}
                settingsActive={settingsOpen}
                hasJson={hasJson}
              />
            </div>
            <JsonAiCleaner onUseJson={handleUseJson} dark={dark} />
          </main>
        )}

        {layout === "split" && (
          <main className="flex flex-1 min-h-0 flex-col md:flex-row min-w-0 overflow-y-auto md:overflow-visible">
            <div className="md:hidden">
              <MobileHeader
                mode={mode}
                onOpenMenu={() => setMobileMenuOpen(true)}
                onOpenShare={handleShareClick}
                onOpenSettings={handleSettingsClick}
                searchOpen={searchOpen}
                onSearchToggle={handleSearchToggle}
                shareActive={shareOpen}
                settingsActive={settingsOpen}
                hasJson={hasJson}
              />
            </div>
            <section
              className="flex flex-col min-w-0 border-r border-border bg-surface1 min-h-[70vh] md:flex-1 md:min-h-0 shrink-0 relative"
              onDragEnter={onEditorDragEnter}
              onDragLeave={onEditorDragLeave}
              onDragOverCapture={onEditorDragOverCapture}
              onDropCapture={onEditorDropCapture}
            >
              {fileDragOver && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-[inherit] m-px bg-primary/10 border-2 border-dashed border-primary/80 backdrop-blur-[1px]"
                  aria-hidden
                >
                  <span className="text-sm font-medium text-foreground px-4 py-2 rounded-lg bg-background/95 shadow-sm border border-border">
                    Drop JSON files to open
                  </span>
                </div>
              )}
              <JsonTabBar
                tabs={tabsState.tabs}
                activeId={tabsState.activeId}
                onSwitch={switchTab}
                onClose={closeTab}
                onRename={renameTab}
                onAdd={addTab}
              />
              <div className="pane-header flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 shrink-0">
                  Editor
                  <InfoHelp
                    text="Edit the active tab here. Beautify, minify, import files, drag JSON onto this column, or fetch from a URL. Tabs persist in this browser."
                    label="About the editor"
                    side="bottom"
                  />
                </span>
                <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5 ml-1">
                  <AppButton
                    onClick={() => format({ indent: settings.format.beautifyIndent, sortKeys: settings.format.sortKeysOnBeautify })}
                    disabled={!hasJson}
                    title="Beautify (⌘⇧F)"
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    label="Beautify"
                    hideLabelOnMobile
                  />
                  <AppButton
                    onClick={minify}
                    disabled={!hasJson}
                    title="Minify (⌘M)"
                    leftIcon={<Minimize2 className="w-3.5 h-3.5" />}
                    label="Minify"
                    hideLabelOnMobile
                  />
                  <AppButton
                    onClick={sortKeys}
                    disabled={!hasJson}
                    title="Sort keys"
                    leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
                    label="Sort"
                    hideLabelOnMobile
                  />
                  <AppButton
                    onClick={handleRepairJson}
                    disabled={!hasJson || !error}
                    title="Repair invalid JSON (quotes, commas, brackets, etc.)"
                    leftIcon={<Wrench className="w-3.5 h-3.5" />}
                    label="Fix"
                    hideLabelOnMobile
                  />
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,.txt,application/json,text/plain"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <AppButton
                  onClick={handleSave}
                  disabled={!hasJson || !!error}
                  title="Save to browser (persists across refresh)"
                  leftIcon={saved ? <Check className="w-3.5 h-3.5 text-primary" /> : <Save className="w-3.5 h-3.5" />}
                  label={saved ? "Saved!" : "Save"}
                  hideLabelOnMobile
                />
                {hasSaved && (
                  <AppButton
                    variant="danger"
                    onClick={handleClearSaved}
                    title="Delete saved data"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    label="Clear saved"
                    hideLabelOnMobile
                  />
                )}
                <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">{lineCount} lines</span>
              </div>
              {activeTab?.curlMeta && (
                <CurlMetaBar
                  meta={activeTab.curlMeta}
                  onRerun={() => {
                    setCurlCommand(activeTab.curlMeta?.command);
                    setCurlOpen(true);
                  }}
                />
              )}
              <div className="flex-1 min-h-0 relative">
                <JsonEditor value={json} onChange={setJson} error={error} dark={dark} editorSettings={settings.editor} onSearchOpen={() => { setMode("tree"); setSearchOpen(true); }} />
                {!hasJson && (
                  <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-6 text-center">
                      <div className="max-w-[280px] bg-surface1/60 backdrop-blur-md border border-border/80 rounded-xl p-6 shadow-sm text-sm text-foreground/80 pointer-events-auto cursor-default">
                        <p className="font-medium mb-4 text-[13px]">Editor is empty</p>
                        {launchConfig && (
                          <div className="mb-4 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-left">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                              {launchConfig.title} ready
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                              {launchConfig.hint}
                            </p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground flex flex-col gap-2">
                        <AppButton
                          variant="ghost"
                          onClick={() => fileRef.current?.click()}
                          leftIcon={<Upload className="w-[14px] h-[14px]" />}
                          label="Import from device"
                          className="w-full justify-center bg-secondary/30 hover:bg-secondary/60 text-foreground"
                        />
                        <div className="flex items-center gap-2 my-1 opacity-50">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] uppercase tracking-wider">or</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-text3/80 font-medium py-1.5 select-none bg-secondary/20 rounded-md border border-border/30 border-dashed">
                          <MousePointerClick className="w-[14px] h-[14px]" />
                          Drag & drop files here
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col min-w-0 bg-surface2 min-h-[60vh] md:flex-1 md:min-h-0 shrink-0">
              {(mode === "tree" || mode === "visual") && searchOpen && (
                <JsonSearchPanel query={query} matchCount={matchCount} currentMatchIndex={currentMatchIndex} onQueryChange={setQuery} onNext={nextMatch} onPrev={prevMatch} onClose={() => { setSearchOpen(false); setQuery(""); }} />
              )}

              {(mode === "tree" || mode === "visual" || mode === "flow") && (
                <>
                  <div className="pane-header">
                    <span className="inline-flex items-center gap-1">
                      {mode === "visual" ? "Visual Editor" : mode === "flow" ? "Flow View" : "Tree View"}
                      <InfoHelp text={MODES[mode].help} label={`About ${MODES[mode].label}`} side="bottom" />
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <AppButton
                        onClick={handleCopy}
                        disabled={!json.trim()}
                        title="Copy JSON"
                        leftIcon={copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        label={copied ? "Copied!" : "Copy"}
                        hideLabelOnMobile
                      />
                      {mode === "tree" && (
                        <>
                          <AppButton
                            onClick={() => setExpandAll(true)}
                            disabled={!parsed}
                            title="Expand all"
                            leftIcon={<ChevronsUpDown className="w-3.5 h-3.5" />}
                            label="Expand"
                            hideLabelOnMobile
                          />
                          <AppButton
                            onClick={() => setExpandAll(false)}
                            disabled={!parsed}
                            title="Collapse all"
                            leftIcon={<ChevronsDownUp className="w-3.5 h-3.5" />}
                            label="Collapse"
                            hideLabelOnMobile
                          />
                        </>
                      )}
                    </div>
                    {parsed !== null && mode !== "flow" && (
                      <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                        {Array.isArray(parsed) ? `${(parsed as unknown[]).length} items` : `${Object.keys(parsed as object).length} keys`}
                      </span>
                    )}
                    {mode === "flow" && parsed !== null && (
                      <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-50 hidden sm:inline">
                        Pan · scroll to zoom · drag nodes
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {mode === "visual" ? (
                      <JsonVisualEditor
                        parsed={parsed}
                        onChange={setJson}
                        dark={dark}
                      />
                    ) : mode === "flow" ? (
                      <JsonFlowView parsed={parsed} dark={dark} />
                    ) : (
                      <JsonTreeView data={parsed} expandAll={expandAll} searchTerm={searchOpen ? query : undefined} activeMatchPath={searchOpen && currentMatch ? currentMatch.path : undefined} treeSettings={settings.treeView} />
                    )}
                  </div>
                </>
              )}
              {mode === "mock" && <JsonMockGenerator onUseJson={handleUseJson} dark={dark} />}
              {mode === "debug" && <JsonDebugger json={json} onFix={setJson} />}
              {mode === "trim" && <JsonTrimmer parsed={parsed} dark={dark} />}
              {mode === "minimal" && <JsonMinimalMode parsed={parsed} dark={dark} />}
              {mode === "structure" && <JsonStructureAnalyzer parsed={parsed} />}
              {mode === "practices" && <JsonBestPractices parsed={parsed} />}
              {mode === "tokens" && <JsonTokenEstimator json={json} parsed={parsed} />}
              {mode === "convert" && <JsonConvertPanel parsed={parsed} dark={dark} />}
              {mode === "notes" && <JsonNoteEditor />}
              {mode === "learn" && (
                <JsonLearnPanel
                  onTryInEditor={(json) => {
                    setJson(json);
                    setMode("tree");
                  }}
                />
              )}
            </section>
          </main>
        )}
      </div>

      <OverlaySidebar
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        aria-label="Share & Export"
      >
        <JsonSharePanel
          json={json}
          onDownloadJson={(content, filename) => handleDownload(content ?? json, filename ?? "data.json")}
          onClose={() => setShareOpen(false)}
          tabs={tabsState.tabs}
          activeTabId={tabsState.activeId}
          curlMeta={activeTab?.curlMeta}
        />
      </OverlaySidebar>

      <OverlaySidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        aria-label="Settings"
      >
        <SettingsPanel onClose={() => setSettingsOpen(false)} />
      </OverlaySidebar>

      <CurlPanel
        open={curlOpen}
        onClose={() => setCurlOpen(false)}
        initialCommand={curlCommand}
        onRun={executeCurlCommand}
      />

      <footer className="status-bar flex-wrap gap-y-1.5 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {statusLabel ? (
            <>
              <span>{statusLabel}</span>
              <span className="text-border">·</span>
              <span className="opacity-50">Esc to {shareOpen || settingsOpen ? "close" : "exit"}</span>
            </>
          ) : (
            <>
              <span>{json.length.toLocaleString()} chars</span>
              <span className="text-border">·</span>
              <span>{lineCount} lines</span>
              {searchOpen && query && (
                <>
                  <span className="text-border">·</span>
                  <span className={matchCount === 0 ? "text-destructive" : "text-primary"}>
                    {matchCount} match{matchCount !== 1 ? "es" : ""}
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {parsed !== null ? (
            <><span className="glow-dot" /><span className="text-primary font-medium">Valid JSON</span></>
          ) : error ? (
            <><span className="glow-dot-error" /><span className="text-destructive font-medium">Invalid JSON</span></>
          ) : (
            <span>No input</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5">
          UTF-8 · JSON
          <InfoHelp
            text="Counts and validation refer to the active tab. Invalid JSON still loads in the editor so you can fix it. Processing stays in your browser unless you use optional short links."
            label="About status bar"
            side="top"
          />
        </span>
      </footer>
    </div>
  );
}
