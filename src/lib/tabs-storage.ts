/**
 * Persist multi-tab JSON to localStorage.
 */

const TABS_KEY = "json-prism-tabs";

export interface TabData {
  id: string;
  name: string;
  json: string;
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

export function loadTabs(): TabsState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TABS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as TabsState;
    if (!Array.isArray(data.tabs) || data.tabs.length === 0) return null;
    const valid = data.tabs.filter((t) => t && t.id && t.name != null && typeof t.json === "string");
    if (valid.length === 0) return null;
    const activeId = valid.some((t) => t.id === data.activeId) ? data.activeId : valid[0].id;
    return { tabs: valid, activeId };
  } catch {
    return null;
  }
}

export function saveTabs(state: TabsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(state));
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
