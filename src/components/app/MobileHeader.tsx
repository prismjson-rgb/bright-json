"use client";
import { Menu, Search, Settings, Share2 } from "lucide-react";
import Logo from "./Logo";
import { AppButton } from "./AppButton";

interface MobileHeaderProps {
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
  onOpenMenu,
  onOpenShare, onOpenSettings,
  searchOpen, onSearchToggle,
  shareActive, settingsActive, hasJson,
}: MobileHeaderProps) {
  return (
    <header className="workspace-mobile-header flex items-center gap-1 border-b border-border bg-surface1 px-2 py-2 shrink-0">
        <AppButton
          variant="icon"
          size="icon"
          onClick={onOpenMenu}
          title="Open menu"
          aria-label="Open menu"
          leftIcon={<Menu className="w-5 h-5" />}
        />
        <Logo size="sm" className="min-w-0 flex-1 [&>div>span:last-child]:hidden" />
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
    </header>
  );
}
