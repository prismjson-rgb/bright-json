"use client";
import { useEffect, useState } from "react";
import { readPreference, writePreference } from "@/lib/local-preferences";

export function useTheme() {
  const [dark, setDark] = useState(true); // Default dark, avoids SSR mismatch
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read actual preference on mount (client only)
    const stored = readPreference("json-viewer-theme");
    if (stored) {
      setDark(stored === "dark");
    } else {
      setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", dark);
    writePreference("json-viewer-theme", dark ? "dark" : "light");
  }, [dark, ready]);

  const toggle = () => setDark((d) => !d);

  return { dark, toggle };
}
