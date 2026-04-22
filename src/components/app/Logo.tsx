"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md";
  className?: string;
}

export default function Logo({ size = "md", className }: LogoProps) {
  const h = size === "sm" ? 28 : 28;
  // natural size 377×312 → at 28px tall, width ≈ 34px
  const w = Math.round(h * (377 / 312));
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <Image
        src="/logo-transparent.png"
        alt="JSON Prism logo"
        width={w}
        height={h}
        className="shrink-0"
        priority
      />
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
