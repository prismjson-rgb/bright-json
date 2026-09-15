"use client";
import { ArrowUpRight, Download, HandHeart, Heart, Search, TerminalSquare, Upload, X } from "lucide-react";
import Link from "next/link";
import { DONATE_URL } from "@/lib/deployment";
import Logo from "./Logo";
import { AppButton } from "./AppButton";
import { InfoHelp } from "./InfoHelp";
import { type PanelMode } from "@/lib/modes";
import { workspaceTool } from "@/lib/workspace-tools";
import type { ToolSlug } from "@/lib/tool-links";

interface LeftRailProps {
  favourites: ToolSlug[];
  onToggleFavourite: (slug: ToolSlug) => void;
  onSelectTool: (slug: ToolSlug) => void;
  onOpenTools: () => void;
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  /** Desktop: collapse to icon-only rail. Ignored in mobile sheet. */
  collapsed?: boolean;
  /** Present only in mobile sheet; shows close button + hides collapse control. */
  onClose?: () => void;
  /** Input actions shown at the top of the rail (Import / From cURL / Export). */
  hasJson?: boolean;
  onImport?: () => void;
  onExport?: () => void;
  /** Opens the cURL panel overlay. */
  onOpenCurl?: () => void;
}

export default function LeftRail({
  mode, favourites, onToggleFavourite, onSelectTool, onOpenTools,
  collapsed = false,
  onClose,
  hasJson, onImport, onExport, onOpenCurl,
}: LeftRailProps) {
  const isMobile = !!onClose;
  const iconOnly = !isMobile && collapsed;

  const hasInputActions = !!(onImport || onExport || onOpenCurl);

  return (
    <aside
      className={`workspace-rail flex flex-col border-r border-border bg-surface1 overflow-y-auto overflow-x-hidden shrink-0 ${
        isMobile ? "w-full min-w-0" : iconOnly ? "w-12" : "w-[244px]"
      }`}
    >
      {/* Header (mobile only - desktop logo lives in top header) */}
      {isMobile && (
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border/60 shrink-0">
          <Logo size="sm" className="min-w-0 flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="px-2.5 pt-2.5">
        <button type="button" onClick={onOpenTools} aria-label="All tools" title="All tools (Ctrl/Cmd+Shift+K)" className="flex items-center gap-2 w-full border border-border bg-secondary/40 px-3 py-2 text-[13px] rounded-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
          <Search className="h-4 w-4 text-primary" />
          {!iconOnly && <><span className="flex-1 text-left">All tools</span><kbd className="text-[10px] text-muted-foreground">⇧⌘K</kbd></>}
        </button>
      </div>
      {DONATE_URL && <div className={`border-b border-border/60 ${iconOnly ? "flex justify-center py-1.5" : "p-2"}`}>
        <div className="relative">
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Support JSON Prism - opens the payment gateway in a new tab"
          aria-label="Donate"
          className={`inline-flex items-center gap-1.5 rounded-md font-medium border border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20 transition-colors ${
            iconOnly ? "justify-center w-9 h-9" : "w-full justify-start pl-3 pr-14 py-2 text-xs"
          }`}
        >
          <HandHeart className="w-[15px] h-[15px] shrink-0 text-rose-600 dark:text-rose-300" />
          {!iconOnly && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <span className="truncate text-rose-600 dark:text-rose-300">Support this project</span>
            </span>
          )}
          {!iconOnly && <ArrowUpRight className="absolute right-3 w-3.5 h-3.5 text-primary" aria-hidden="true" />}
          <span className="sr-only">Opens the payment gateway in a new tab</span>
        </a>
        {!iconOnly && <InfoHelp
          text="JSON Prism runs entirely in your browser - no account, no ads, nothing you paste ever touches a server. If it's saved you a headache or two, a small donation keeps it that way and helps me keep building. Never required, always appreciated. ❤️"
          label="About Donate"
          side="right"
          className="absolute right-9 top-1/2 -translate-y-1/2"
        />}
        </div>
      </div>}

      {/* Input section (Import / From URL / Export) - surfaced here because
       *  users kept missing these buried in the editor toolbar, especially
       *  From URL. Keeping it as the first rail group makes the entry
       *  points obvious and gives drag-drop a visible neighbor. */}
      {hasInputActions && (
        <div className="flex flex-col border-b border-border/60">
          {!iconOnly && (
            <div className="px-3 pt-3 pb-1 flex items-center gap-1.5 select-none">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-text3/60">
                Get started
              </span>
              <InfoHelp
                text="Load JSON into a new tab (pick files, run a curl command, or drag files onto the editor) and export the current tab as a .json file."
                label="About Get started"
                side="right"
                className="opacity-80"
              />
            </div>
          )}
          <div className={`flex flex-col ${iconOnly ? "items-center py-1.5 gap-1" : ""}`}>
            {onImport && (
              <AppButton
                variant="rail"
                size={iconOnly ? "icon" : "sm"}
                onClick={onImport}
                title="Import .json / .txt files (or drag files onto the editor)"
                aria-label="Import files"
                leftIcon={<Upload className="w-[15px] h-[15px]" />}
                label={
                  <span className="inline-flex items-center gap-1 min-w-0 text-xs">
                    <span className="truncate">Import</span>
                  </span>
                }
                iconOnly={iconOnly}
                className={iconOnly ? "justify-center w-9" : "px-3 py-2"}
              />
            )}
            {onOpenCurl && (
              <AppButton
                variant="rail"
                size={iconOnly ? "icon" : "sm"}
                onClick={onOpenCurl}
                title="Run a curl command and load the response as a new tab"
                aria-label="From cURL"
                leftIcon={<TerminalSquare className="w-[15px] h-[15px]" />}
                label={
                  <span className="inline-flex items-center gap-1 min-w-0 text-xs">
                    <span className="truncate">From cURL</span>
                  </span>
                }
                iconOnly={iconOnly}
                className={iconOnly ? "justify-center w-9" : "px-3 py-2"}
              />
            )}
            {onExport && (
              <AppButton
                variant="rail"
                size={iconOnly ? "icon" : "sm"}
                onClick={onExport}
                disabled={!hasJson}
                title="Export current tab as .json"
                aria-label="Export"
                leftIcon={<Download className="w-[15px] h-[15px]" />}
                label={
                  <span className="inline-flex items-center gap-1 min-w-0 text-xs">
                    <span className="truncate">Export</span>
                  </span>
                }
                iconOnly={iconOnly}
                className={iconOnly ? "justify-center w-9" : "px-3 py-2"}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col px-2 pt-4 pb-3">
        {!iconOnly && <div className="flex items-center gap-2 px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Favourites <span>{favourites.length}</span></div>}
        {favourites.map(slug => {
          const tool = workspaceTool(slug);
          const Icon = tool.icon;
          return <div key={slug} className="flex items-center min-w-0">
            <AppButton variant="rail" size={iconOnly ? "icon" : "sm"} active={mode === tool.mode} onClick={() => onSelectTool(slug)} title={tool.help} aria-label={tool.label} leftIcon={<Icon className="w-[15px] h-[15px]" />} label={tool.label} iconOnly={iconOnly} className="flex-1 min-w-0 px-2 py-2" />
            {!iconOnly && <><InfoHelp text={tool.help} label={"About " + tool.label} side="right" /><button type="button" onClick={() => onToggleFavourite(slug)} aria-label={"Remove " + tool.label + " from favourites"} className="shrink-0 p-2 text-primary rounded-sm hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"><Heart className="w-3 h-3 fill-current" /></button></>}
          </div>;
        })}
        {!iconOnly && !favourites.length && <p className="mx-2 mt-1 p-3 border border-dashed border-border text-xs leading-relaxed text-muted-foreground">No favourites yet. Open All tools and use the heart to pin the ones you use.</p>}
      </div>

      {/* Footer: legal links */}
      {!iconOnly && (
        <div className="mt-auto border-t border-border/60 p-2">
          <p className="text-[10px] font-mono text-muted-foreground px-2 py-2">Editing stays in your browser</p>
          <div className="flex items-center justify-center gap-2 pb-1">
            <Link href="/privacy" className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Privacy</Link>
            <span className="text-[9px] text-muted-foreground/30">·</span>
            <Link href="/terms" className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Terms</Link>
          </div>
        </div>
      )}
    </aside>
  );
}
