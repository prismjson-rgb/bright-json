"use client";
import { Download, TerminalSquare, Upload, X } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { AppButton } from "./AppButton";
import { InfoHelp } from "./InfoHelp";
import { RAIL_GROUPS, railModesForGroup, type PanelMode } from "@/lib/modes";

interface LeftRailProps {
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
  mode, onModeChange,
  collapsed = false,
  onClose,
  hasJson, onImport, onExport, onOpenCurl,
}: LeftRailProps) {
  const isMobile = !!onClose;
  const iconOnly = !isMobile && collapsed;

  const hasInputActions = !!(onImport || onExport || onOpenCurl);

  return (
    <aside
      className={`flex flex-col border-r border-border bg-surface1 overflow-y-auto overflow-x-hidden shrink-0 ${
        isMobile ? "w-full min-w-0" : iconOnly ? "w-12" : "w-44"
      }`}
    >
      {/* Header (mobile only — desktop logo lives in top header) */}
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

      {/* Input section (Import / From URL / Export) — surfaced here because
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
                    <InfoHelp
                      text="Pick one or more .json / .txt files. You can also drag files from your file manager onto the editor column — every file opens as its own tab."
                      label="About Import"
                      side="right"
                      className="shrink-0"
                    />
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
                    <InfoHelp
                      text="Paste any curl command — supports -X, -H, -d, --json, -u. Runs the request from your browser and opens the JSON response as a new tab. Share the result as a full curl + response link."
                      label="About From cURL"
                      side="right"
                      className="shrink-0"
                    />
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
                    <InfoHelp
                      text="Download the active tab's JSON as a .json file."
                      label="About Export"
                      side="right"
                      className="shrink-0"
                    />
                  </span>
                }
                iconOnly={iconOnly}
                className={iconOnly ? "justify-center w-9" : "px-3 py-2"}
              />
            )}
          </div>
        </div>
      )}

      {/* Groups from registry */}
      {RAIL_GROUPS.map((group, gi) => {
        const items = railModesForGroup(group.key);
        if (items.length === 0) return null;
        return (
          <div key={group.key} className={`flex flex-col ${gi > 0 ? "border-t border-border/60" : ""}`}>
            {!iconOnly && (
              <div className="px-3 pt-3 pb-1 flex items-center gap-1.5 select-none">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-text3/60">
                  {group.label}
                </span>
                <InfoHelp
                  text={group.help}
                  label={`About ${group.label}`}
                  side="right"
                  className="opacity-80"
                />
              </div>
            )}
            <div className={`flex flex-col ${iconOnly ? "items-center py-1.5 gap-1" : ""}`}>
              {items.map((cfg) => {
                const Icon = cfg.icon;
                const isActive = mode === cfg.id;
                return (
                  <AppButton
                    key={cfg.id}
                    variant="rail"
                    size={iconOnly ? "icon" : "sm"}
                    active={isActive}
                    onClick={() => onModeChange(cfg.id)}
                    title={cfg.shortcut ? `${cfg.label} (${cfg.shortcut})` : cfg.label}
                    aria-label={cfg.label}
                    leftIcon={<Icon className="w-[15px] h-[15px]" />}
                    label={
                      <span className="inline-flex items-center gap-1 min-w-0 text-xs">
                        <span className="truncate">{cfg.label}</span>
                        {/* Nested inside the button so the icon sits right next
                         *  to the label instead of getting pushed to the row's
                         *  right edge. InfoHelp stops propagation so clicks
                         *  don't accidentally switch modes. */}
                        <InfoHelp
                          text={cfg.help}
                          label={`About ${cfg.label}`}
                          side="right"
                          className="shrink-0"
                        />
                      </span>
                    }
                    rightIcon={cfg.hint ? <span>{cfg.hint}</span> : undefined}
                    shortcut={cfg.shortcut}
                    iconOnly={iconOnly}
                    className={iconOnly ? "justify-center w-9" : "px-3 py-2"}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer: legal links */}
      {!iconOnly && (
        <div className="mt-auto border-t border-border/60 p-2">
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
