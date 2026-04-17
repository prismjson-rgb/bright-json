"use client";
import { Menu } from "lucide-react";
import Logo from "./Logo";
import { AppButton } from "./AppButton";
import { MODES, type PanelMode } from "@/lib/modes";

interface MobileHeaderProps {
  mode: PanelMode;
  onOpenMenu: () => void;
}

export default function MobileHeader({ mode, onOpenMenu }: MobileHeaderProps) {
  const label = MODES[mode]?.label ?? "";
  return (
    <div className="flex flex-col border-b border-border bg-surface1 shrink-0">
      <div className="flex items-center gap-2 px-3 py-2">
        <AppButton
          variant="icon"
          size="icon"
          onClick={onOpenMenu}
          title="Open menu"
          aria-label="Open menu"
          leftIcon={<Menu className="w-5 h-5" />}
        />
        <Logo size="sm" className="min-w-0 flex-1" />
      </div>
      {label && (
        <div className="px-3 pb-2 pt-0 pl-[3.25rem]">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/90 truncate block">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
