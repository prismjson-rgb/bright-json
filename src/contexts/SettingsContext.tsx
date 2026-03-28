"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { AppSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS, loadSettings, saveSettings as persistSettings } from "@/lib/settings";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (update: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    void loadSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((update: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = merge(prev, update);
      void persistSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    void persistSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

function merge<T extends object>(target: T, patch: Partial<T>): T {
  const out = { ...target } as Record<string, unknown>;
  for (const k of Object.keys(patch) as (keyof T)[]) {
    const v = patch[k];
    if (v === undefined) continue;
    const key = String(k);
    if (
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v) &&
      typeof target[k] === "object"
    ) {
      out[key] = merge(target[k] as object, v as Partial<object>);
    } else {
      out[key] = v;
    }
  }
  return out as T;
}
