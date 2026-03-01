import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "added" | "removed" | "modified" | "neutral";

export interface DiffLineProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  lineNumber?: number | string;
  symbol?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<
  Exclude<Variant, "neutral">,
  { bg: string; bar: string; symbol: string }
> = {
  added: {
    bg: "hsl(var(--diff-add-bg))",
    bar: "hsl(var(--diff-add))",
    symbol: "+",
  },
  removed: {
    bg: "hsl(var(--diff-del-bg))",
    bar: "hsl(var(--diff-del))",
    symbol: "-",
  },
  modified: {
    bg: "hsl(var(--diff-mod-bg))",
    bar: "hsl(var(--diff-mod))",
    symbol: "~",
  },
};

export function DiffLine({
  className,
  variant = "neutral",
  lineNumber,
  symbol,
  children,
  ...rest
}: DiffLineProps) {
  const style = variant === "neutral" ? null : variantStyles[variant];

  return (
    <div
      className={cn(
        "flex text-xs font-mono",
        variant === "neutral" ? "bg-transparent" : "",
        className,
      )}
      style={style ? { backgroundColor: style.bg } : undefined}
      {...rest}
    >
      {/* Gutter bar */}
      <div
        className={cn(
          "w-1",
          variant === "neutral" ? "bg-transparent" : "",
        )}
        style={style ? { backgroundColor: style.bar } : undefined}
      />
      {/* Line content */}
      <div className="flex-1 flex items-stretch gap-3 px-3 py-1.5">
        <div className="w-8 text-right text-text3 select-none">
          {lineNumber != null ? lineNumber : ""}
        </div>
        <div className="w-3 text-text3 select-none">
          {symbol ?? (variant === "neutral" ? "" : style?.symbol)}
        </div>
        <code className="flex-1 whitespace-pre overflow-x-auto text-text1">
          {children}
        </code>
      </div>
    </div>
  );
}

