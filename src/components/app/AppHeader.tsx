"use client";
import { Menu, Moon, Search, Settings, Share2, Sun } from "lucide-react";
import Logo from "./Logo";
import ModeTabs from "./ModeTabs";
import { AppButton } from "./AppButton";
import { InfoHelp } from "./InfoHelp";
import type { PanelMode } from "@/lib/modes";

interface AppHeaderProps {
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  dark: boolean;
  onToggleTheme: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
  shareActive?: boolean;
  settingsActive?: boolean;
  hasJson: boolean;
  railCollapsed?: boolean;
  onToggleRail?: () => void;
}

export default function AppHeader({
  mode, onModeChange, dark, onToggleTheme,
  onOpenShare, onOpenSettings, searchOpen, onSearchToggle,
  shareActive, settingsActive, hasJson,
  railCollapsed, onToggleRail,
}: AppHeaderProps) {
  return (
    <header className="toolbar-header flex items-stretch h-12 border-b border-border bg-surface1 shrink-0">
      {onToggleRail && !railCollapsed && (
        <div className="flex items-center border-r border-border shrink-0 gap-2 w-44 pl-2 pr-2">
          <AppButton
            variant="icon"
            size="icon"
            onClick={onToggleRail}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            leftIcon={<Menu className="w-4 h-4" />}
          />
          <Logo className="min-w-0 flex-1" />
        </div>
      )}
      <div className="flex items-center gap-3 px-4 flex-1 min-w-0">
        {onToggleRail && railCollapsed && (
          <>
            <AppButton
              variant="icon"
              size="icon"
              onClick={onToggleRail}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              leftIcon={<Menu className="w-4 h-4" />}
              className="shrink-0"
            />
            <Logo className="shrink-0" />
            <div className="h-6 w-px bg-border shrink-0 ml-1" aria-hidden />
          </>
        )}
        {!onToggleRail && (
          <>
            <Logo className="shrink-0" />
            <div className="h-6 w-px bg-border shrink-0 ml-1" aria-hidden />
          </>
        )}

        <ModeTabs mode={mode} onChange={onModeChange} className="flex-1 min-w-0" />

      <div className="flex items-center shrink-0 gap-0.5 pl-2.5 ml-0.5 border-l border-border/70">
        <InfoHelp
          text="View tabs switch the right panel (Tree, Visual, Flow, full-screen Diff). Tree and Visual work with Search (Ctrl/Cmd+K). Icons here: Search, Share (needs JSON), Theme (Ctrl/Cmd+L), Settings. New editor tab: Ctrl/Cmd+T. Other tools are in the left sidebar."
          label="About the header and view modes"
          side="bottom"
          className="self-center mr-0.5"
        />
        <AppButton
          variant="icon"
          size="icon"
          onClick={onSearchToggle}
          active={searchOpen}
          title="Search (⌘K)"
          aria-label="Search"
          leftIcon={<Search className="w-4 h-4" />}
        />
        <AppButton
          variant="icon"
          size="icon"
          onClick={onOpenShare}
          active={!!shareActive}
          disabled={!hasJson}
          title="Share & Export"
          aria-label="Share & Export"
          leftIcon={<Share2 className="w-4 h-4" />}
        />
        <AppButton
          variant="icon"
          size="icon"
          onClick={onToggleTheme}
          title="Toggle theme (⌘L)"
          aria-label="Toggle theme"
          leftIcon={dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        />
        <AppButton
          variant="icon"
          size="icon"
          onClick={onOpenSettings}
          active={!!settingsActive}
          title="Settings"
          aria-label="Settings"
          leftIcon={<Settings className="w-4 h-4" />}
        />
      </div>
      </div>
    </header>
  );
}
