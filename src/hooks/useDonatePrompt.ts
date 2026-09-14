"use client";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "json-viewer-donate-prompt";
const ACTIVE_TIME_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const TICK_MS = 5000;

function hasBeenDismissed(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "dismissed";
}

function markDismissed() {
  localStorage.setItem(STORAGE_KEY, "dismissed");
}

/**
 * Surfaces the donate prompt once someone has had real JSON open and the tab
 * visible for 10 cumulative active minutes in this session — not just an idle
 * tab left open in the background. Dismissing it (any way: the X, "Maybe
 * later", clicking outside, Escape) is permanent for this browser; it never
 * asks again. There's no server here, so localStorage is the only memory we
 * have — that's the deliberate tradeoff of a static site.
 */
export function useDonatePrompt(hasJson: boolean): { open: boolean; dismiss: () => void } {
  const [open, setOpen] = useState(false);
  const activeMsRef = useRef(0);
  const hasJsonRef = useRef(hasJson);
  hasJsonRef.current = hasJson;

  useEffect(() => {
    if (hasBeenDismissed()) return;

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible" || !hasJsonRef.current) return;
      activeMsRef.current += TICK_MS;
      if (activeMsRef.current >= ACTIVE_TIME_THRESHOLD_MS) {
        clearInterval(interval);
        setOpen(true);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // Dev-only console helper — the 10-minute timer is impractical to sit
  // through while testing. Never runs in production builds.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as any).__donatePrompt = {
      show: () => setOpen(true),
      reset: () => localStorage.removeItem(STORAGE_KEY),
    };
    return () => {
      delete (window as any).__donatePrompt;
    };
  }, []);

  const dismiss = () => {
    setOpen(false);
    markDismissed();
  };

  return { open, dismiss };
}
