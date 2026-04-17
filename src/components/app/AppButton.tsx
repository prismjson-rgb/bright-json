"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Single button primitive for the app chrome. One place to change how buttons
 * look, so toolbars, rails, and tabs can't drift.
 *
 * Variants:
 *   - ghost:  default muted action (toolbar buttons, inline copy/save).
 *   - accent: highlighted action (Beautify, primary CTAs).
 *   - danger: destructive action (Clear saved, delete).
 *   - tab:    top-header view-mode tab (underline-active).
 *   - rail:   left-rail navigation item (pill-active, full-width row).
 *   - icon:   bare icon-only circle (theme toggle, close).
 */
const buttonStyles = cva(
  [
    "inline-flex items-center gap-1.5 font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "whitespace-nowrap select-none",
  ],
  {
    variants: {
      variant: {
        ghost:  "rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10",
        accent: "rounded-lg text-primary hover:bg-primary/10",
        danger: "rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10",
        tab:    "relative rounded-none border-b-2 border-transparent text-muted-foreground hover:text-foreground",
        rail:   "justify-start w-full rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10",
        icon:   "rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 justify-center",
      },
      size: {
        sm:   "text-xs px-2.5 py-1.5",
        md:   "text-sm px-3 py-2",
        lg:   "text-sm px-4 py-2.5",
        icon: "w-9 h-9 p-0",
      },
      active: { true: "", false: "" },
    },
    compoundVariants: [
      { variant: "tab",    active: true,  class: "text-foreground border-primary" },
      { variant: "rail",   active: true,  class: "bg-primary/10 text-primary hover:bg-primary/10" },
      { variant: "ghost",  active: true,  class: "bg-primary/10 text-primary" },
      { variant: "accent", active: true,  class: "bg-primary/15" },
      { variant: "icon",   active: true,  class: "text-primary bg-primary/10" },
    ],
    defaultVariants: { variant: "ghost", size: "sm", active: false },
  },
);

export interface AppButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonStyles> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Shortcut hint (e.g. "⌘K") shown on the right. Ignored if rightIcon is set. */
  shortcut?: string;
  /** Label text. Hidden on small screens when `hideLabelOnMobile` is set. */
  label?: React.ReactNode;
  hideLabelOnMobile?: boolean;
  /** When true, only renders the left icon (collapsed rail). */
  iconOnly?: boolean;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({
    className, variant, size, active,
    leftIcon, rightIcon, shortcut, label, hideLabelOnMobile, iconOnly,
    type = "button", ...props
  }, ref) => {
    const showLabel = !iconOnly && label != null;
    const showRight = !iconOnly && (rightIcon != null || !!shortcut);
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonStyles({ variant, size, active }), className)}
        {...props}
      >
        {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
        {showLabel && (
          <span className={cn("truncate", hideLabelOnMobile && "hidden sm:inline")}>
            {label}
          </span>
        )}
        {showRight && (
          <span className="ml-auto shrink-0 flex items-center text-[10px] font-mono opacity-50">
            {rightIcon ?? shortcut}
          </span>
        )}
      </button>
    );
  },
);
AppButton.displayName = "AppButton";
