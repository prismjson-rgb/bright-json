/**
 * Persist multi-tab JSON to IndexedDB (async, non-blocking). Migrates legacy localStorage once.
 */

import { idbGet, idbSet } from "@/lib/json-prism-idb";

const IDB_KEY = "json-prism-tabs-v1";
const LEGACY_LS_KEY = "json-prism-tabs";

export interface CurlMeta {
  command: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  responseHeaders: Record<string, string>;
  timing: number;
}

export interface TabData {
  id: string;
  name: string;
  json: string;
  curlMeta?: CurlMeta;
}

export interface TabsState {
  tabs: TabData[];
  activeId: string;
}

function defaultTabs(): TabData[] {
  const sample = JSON.stringify(
    {
      name: "JSON Prism",
      version: "2.0.0",
      description: "A modern, blazing-fast JSON formatter and viewer",
      features: ["format", "minify", "validate", "tree view", "syntax highlighting"],
      config: { theme: "dark", fontSize: 13 },
      isAwesome: true,
    },
    null,
    2
  );
  return [{ id: crypto.randomUUID(), name: "Untitled 1", json: sample }];
}

function normalizeTabsState(data: unknown): TabsState | null {
  if (!data || typeof data !== "object") return null;
  const d = data as TabsState;
  if (!Array.isArray(d.tabs) || d.tabs.length === 0) return null;
  const valid = d.tabs.filter((t) => t && t.id && t.name != null && typeof t.json === "string");
  if (valid.length === 0) return null;
  const activeId = valid.some((t) => t.id === d.activeId) ? d.activeId : valid[0].id;
  return { tabs: valid, activeId };
}

export async function loadTabs(): Promise<TabsState | null> {
  if (typeof window === "undefined") return null;
  try {
    const fromIdb = await idbGet<TabsState>(IDB_KEY);
    const normalized = normalizeTabsState(fromIdb);
    if (normalized) return normalized;

    const raw = localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const migrated = normalizeTabsState(parsed);
    if (!migrated) return null;
    await idbSet(IDB_KEY, migrated);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
    return migrated;
  } catch {
    return null;
  }
}

export async function saveTabs(state: TabsState): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await idbSet(IDB_KEY, state);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}

export function createTab(name?: string): TabData {
  return {
    id: crypto.randomUUID(),
    name: name ?? `Untitled`,
    json: "",
  };
}

export { defaultTabs };

export function getNextTabName(tabs: TabData[]): string {
  const used = new Set(tabs.map((t) => t.name));
  for (let i = 1; i <= tabs.length + 1; i++) {
    const name = `Untitled ${i}`;
    if (!used.has(name)) return name;
  }
  return `Untitled ${Date.now().toString(36).slice(-4)}`;
}
