"use client";
import { Menu, Search, Settings, Share2 } from "lucide-react";
import Logo from "./Logo";
import { AppButton } from "./AppButton";
import { InfoHelp } from "./InfoHelp";
import { MODES, type PanelMode } from "@/lib/modes";

interface MobileHeaderProps {
  mode: PanelMode;
  onOpenMenu: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
  shareActive?: boolean;
  settingsActive?: boolean;
  hasJson: boolean;
}

export default function MobileHeader({
  mode, onOpenMenu,
  onOpenShare, onOpenSettings,
  searchOpen, onSearchToggle,
  shareActive, settingsActive, hasJson,
}: MobileHeaderProps) {
  const label = MODES[mode]?.label ?? "";
  return (
    <div className="flex flex-col border-b border-border bg-surface1 shrink-0">
      <div className="flex items-center gap-1 px-3 py-2">
        <AppButton
          variant="icon"
          size="icon"
          onClick={onOpenMenu}
          title="Open menu"
          aria-label="Open menu"
          leftIcon={<Menu className="w-5 h-5" />}
        />
        <Logo size="sm" className="min-w-0 flex-1" />
        <div className="flex items-center gap-0.5 shrink-0">
          <AppButton
            variant="icon"
            size="icon"
            onClick={onSearchToggle}
            active={searchOpen}
            title="Search"
            aria-label="Search"
            leftIcon={<Search className="w-5 h-5" />}
          />
          <AppButton
            variant="icon"
            size="icon"
            onClick={onOpenShare}
            active={!!shareActive}
            disabled={!hasJson}
            title="Share & Export"
            aria-label="Share & Export"
            leftIcon={<Share2 className="w-5 h-5" />}
          />
          <AppButton
            variant="icon"
            size="icon"
            onClick={onOpenSettings}
            active={!!settingsActive}
            title="Settings"
            aria-label="Settings"
            leftIcon={<Settings className="w-5 h-5" />}
          />
        </div>
      </div>
      {label && (
        <div className="px-3 pb-2 pt-0 pl-[3.25rem] flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/90 truncate flex-1 min-w-0">
            {label}
          </span>
          <InfoHelp
            text={MODES[mode].help}
            label={`About ${label}`}
            side="left"
            className="shrink-0"
          />
        </div>
      )}
    </div>
  );
}
