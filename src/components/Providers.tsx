"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <TooltipProvider delayDuration={320}>{children}</TooltipProvider>
    </SettingsProvider>
  );
}
