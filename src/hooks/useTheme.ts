"use client";
import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(true); // Default dark, avoids SSR mismatch

  useEffect(() => {
    // Read actual preference on mount (client only)
    const stored = localStorage.getItem("json-viewer-theme");
    if (stored) {
      setDark(stored === "dark");
    } else {
      setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("json-viewer-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return { dark, toggle };
}
