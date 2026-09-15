"use client";
import Link from "next/link";
import { Menu, Moon, Search, Settings, Share2, Sun } from "lucide-react";
import Logo from "./Logo";
import type { ReactNode } from "react";
import { AppButton } from "./AppButton";
import { InfoHelp } from "./InfoHelp";
import type { PanelMode } from "@/lib/modes";

interface AppHeaderProps {
  documentTabs?: ReactNode;
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
  documentTabs, dark, onToggleTheme,
  onOpenShare, onOpenSettings, searchOpen, onSearchToggle,
  shareActive, settingsActive, hasJson,
  railCollapsed, onToggleRail,
}: AppHeaderProps) {
  return (
    <header className="toolbar-header flex items-center h-[46px] border-b border-border bg-surface1 shrink-0">
      <div className={`workspace-brand flex items-center gap-2 px-3 h-full shrink-0 border-r border-border ${railCollapsed ? "w-[210px]" : "w-[244px]"}`}>
      {onToggleRail && (
        <AppButton
          variant="icon"
          size="icon"
          onClick={onToggleRail}
          title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          leftIcon={<Menu className="w-4 h-4" />}
          className="shrink-0"
        />
      )}
      <Link
        href="/"
        aria-label="JSON Prism home"
        className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <Logo />
      </Link>
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-0">

        {documentTabs}

      <div className="flex items-center shrink-0 gap-0.5 pl-2.5 ml-0.5 border-l border-border/70">
        <InfoHelp
          text="View tabs switch the right panel (Tree, Visual, Flow, full-screen Diff). Tree and Visual work with Search (Ctrl/Cmd+K). Icons here: Search, Share (needs JSON), Theme (Ctrl/Cmd+L), Settings. New editor tab: Ctrl/Cmd+T. Other tools are in the left sidebar."
          label="About the header and view modes"
          side="top"
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
