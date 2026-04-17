"use client";
import { Braces } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md";
  className?: string;
}

export default function Logo({ size = "md", className }: LogoProps) {
  const box = size === "md" ? "w-7 h-7" : "w-7 h-7";
  const icon = "w-4 h-4";
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <div className={cn(
        box,
        "rounded-lg bg-primary/10 dark:bg-grad-teal flex items-center justify-center shrink-0 dark:text-white",
      )}>
        <Braces className={cn(icon, "text-primary dark:text-white")} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-sm tracking-tight text-foreground leading-none truncate">
          JSON Prism
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight truncate">
          Format · Diff · Transform
        </span>
      </div>
    </div>
  );
}
