"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface InfoHelpProps {
  /** Help copy shown in the tooltip */
  text: React.ReactNode;
  /** Accessible name, e.g. "About Tree View" */
  label?: string;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  /** Compact icon for toolbars and rail rows */
  size?: "sm" | "md";
}

/**
 * Small info icon that shows explanatory text on hover/focus (Radix tooltip).
 * Trigger is a focusable span so it can sit beside buttons without nesting <button>.
 */
export function InfoHelp({
  text,
  label = "More information",
  className,
  iconClassName,
  side = "top",
  size = "sm",
}: InfoHelpProps) {
  const iconPx = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <Tooltip delayDuration={280}>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-muted-foreground",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-help",
            className,
          )}
          aria-label={label}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") e.stopPropagation();
          }}
        >
          <Info className={cn(iconPx, iconClassName)} aria-hidden strokeWidth={2} />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[min(90vw,20rem)] text-xs leading-relaxed font-normal normal-case tracking-normal"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
