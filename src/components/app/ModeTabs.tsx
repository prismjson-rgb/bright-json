"use client";
import { AppButton } from "./AppButton";
import { MODES, VIEW_MODES, type PanelMode } from "@/lib/modes";

interface ModeTabsProps {
  mode: PanelMode;
  onChange: (mode: PanelMode) => void;
  className?: string;
}

export default function ModeTabs({ mode, onChange, className }: ModeTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="View modes"
      className={`flex items-stretch gap-1 ${className ?? ""}`}
    >
      {VIEW_MODES.map((m) => {
        const cfg = MODES[m];
        const Icon = cfg.icon;
        const isActive = mode === m;
        return (
          <AppButton
            key={m}
            role="tab"
            aria-selected={isActive}
            variant="tab"
            size="md"
            active={isActive}
            onClick={() => onChange(m)}
            title={cfg.shortcut ? `${cfg.label} (${cfg.shortcut})` : cfg.label}
            leftIcon={<Icon className="w-4 h-4" />}
            label={<span className="uppercase tracking-wider text-xs">{cfg.label}</span>}
            hideLabelOnMobile
          />
        );
      })}
    </nav>
  );
}
