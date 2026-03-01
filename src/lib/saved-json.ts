/**
 * Persist JSON to localStorage. Data survives page refresh until explicitly cleared.
 */

const STORAGE_KEY = "json-prism-saved";

export function saveJson(json: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    JSON.parse(json); // validate before saving
  } catch {
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch {
    return false;
  }
}

export function loadSavedJson(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    JSON.parse(raw); // validate
    return raw;
  } catch {
    return null;
  }
}

export function hasSavedJson(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearSavedJson(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
