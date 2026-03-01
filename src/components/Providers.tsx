"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SettingsProvider>
  );
}
