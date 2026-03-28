/**
 * Persist JSON via IndexedDB (async). Migrates legacy localStorage entry once.
 */

import { idbGet, idbSet, idbDelete } from "@/lib/json-prism-idb";

const IDB_KEY = "json-prism-saved-v1";
const LEGACY_LS_KEY = "json-prism-saved";

export async function saveJson(json: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    JSON.parse(json);
  } catch {
    return false;
  }
  try {
    await idbSet(IDB_KEY, json);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
    return true;
  } catch {
    return false;
  }
}

export async function loadSavedJson(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const fromIdb = await idbGet<string>(IDB_KEY);
    if (typeof fromIdb === "string" && fromIdb.length > 0) {
      JSON.parse(fromIdb);
      return fromIdb;
    }

    const raw = localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return null;
    JSON.parse(raw);
    await idbSet(IDB_KEY, raw);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
    return raw;
  } catch {
    return null;
  }
}

export async function hasSavedJson(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const fromIdb = await idbGet<string>(IDB_KEY);
    if (typeof fromIdb === "string" && fromIdb.length > 0) return true;
    return localStorage.getItem(LEGACY_LS_KEY) !== null;
  } catch {
    return false;
  }
}

export async function clearSavedJson(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await idbDelete(IDB_KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    /* ignore */
  }
}
