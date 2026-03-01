import * as React from "react";
import { cn } from "@/lib/utils";

export interface CodePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
}

export function CodePanel({ className, header, children, ...rest }: CodePanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border text-xs font-mono overflow-hidden",
        className,
      )}
      style={{
        background: "hsl(var(--code-bg))",
        borderColor: "hsl(var(--code-border))",
      }}
      {...rest}
    >
      {header ? (
        <div className="flex items-center justify-between px-3 py-2 text-[11px] text-text3 bg-surface2/60 border-b border-border/60">
          {header}
        </div>
      ) : null}
      <div className="px-3 py-2 overflow-auto">{children}</div>
    </div>
  );
}

