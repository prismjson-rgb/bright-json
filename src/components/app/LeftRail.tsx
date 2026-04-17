"use client";
import { ChevronLeft, ChevronRight, Search, Settings, X } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { AppButton } from "./AppButton";
import { RAIL_GROUPS, railModesForGroup, type PanelMode } from "@/lib/modes";

interface LeftRailProps {
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  searchOpen: boolean;
  onSearchToggle: (open: boolean) => void;
  settingsOpen?: boolean;
  onSettingsClick?: () => void;
  /** Desktop: collapse to icon-only rail. Ignored in mobile sheet. */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Present only in mobile sheet; shows close button + hides collapse control. */
  onClose?: () => void;
}

export default function LeftRail({
  mode, onModeChange,
  searchOpen, onSearchToggle,
  settingsOpen, onSettingsClick,
  collapsed = false, onToggleCollapse,
  onClose,
}: LeftRailProps) {
  const isMobile = !!onClose;
  const iconOnly = !isMobile && collapsed;

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

      {/* Groups from registry */}
      {RAIL_GROUPS.map((group, gi) => {
        const items = railModesForGroup(group.key);
        if (items.length === 0) return null;
        return (
          <div key={group.key} className={`flex flex-col ${gi > 0 ? "border-t border-border/60" : ""}`}>
            {!iconOnly && (
              <span className="px-3 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-text3/60 select-none">
                {group.label}
              </span>
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
                    label={<span className="text-xs">{cfg.label}</span>}
                    rightIcon={cfg.hint ? <span>{cfg.hint}</span> : undefined}
                    shortcut={cfg.shortcut}
                    iconOnly={iconOnly}
                    className={iconOnly ? "" : "px-3 py-2"}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Utility group: Search + Settings */}
      <div className="flex flex-col border-t border-border/60">
        {!iconOnly && (
          <span className="px-3 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-text3/60 select-none">
            Utility
          </span>
        )}
        <div className={`flex flex-col ${iconOnly ? "items-center py-1.5 gap-1" : ""}`}>
          <AppButton
            variant="rail"
            size={iconOnly ? "icon" : "sm"}
            active={searchOpen}
            onClick={() => {
              if (!(mode === "tree" || mode === "visual")) onModeChange("tree");
              onSearchToggle(!searchOpen);
            }}
            title="Search (⌘K)"
            aria-label="Search"
            leftIcon={<Search className="w-[15px] h-[15px]" />}
            label={<span className="text-xs">Search</span>}
            shortcut="⌘K"
            iconOnly={iconOnly}
            className={iconOnly ? "" : "px-3 py-2"}
          />
          {onSettingsClick && (
            <AppButton
              variant="rail"
              size={iconOnly ? "icon" : "sm"}
              active={!!settingsOpen}
              onClick={onSettingsClick}
              title="Settings"
              aria-label="Settings"
              leftIcon={<Settings className="w-[15px] h-[15px]" />}
              label={<span className="text-xs">Settings</span>}
              iconOnly={iconOnly}
              className={iconOnly ? "" : "px-3 py-2"}
            />
          )}
        </div>
      </div>

      {/* Footer: collapse toggle (desktop) + legal links */}
      <div className="mt-auto border-t border-border/60 p-2 flex flex-col gap-1">
        {!isMobile && onToggleCollapse && (
          <AppButton
            variant="icon"
            size="icon"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            leftIcon={collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            className="w-full"
          />
        )}
        {!iconOnly && (
          <div className="flex items-center justify-center gap-2 pb-1">
            <Link href="/privacy" className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Privacy</Link>
            <span className="text-[9px] text-muted-foreground/30">·</span>
            <Link href="/terms" className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Terms</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
