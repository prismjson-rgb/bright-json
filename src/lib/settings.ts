/**
 * User-editable JSON editor & viewer settings.
 * Persisted in IndexedDB (async). Migrates legacy localStorage once.
 */

import { idbGet, idbSet } from "@/lib/json-prism-idb";

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineNumbers: "on" | "off" | "relative";
  wordWrap: "on" | "off";
  tabSize: number;
  minimap: boolean;
  bracketPairColorization: boolean;
  paddingTop: number;
  renderLineHighlight: "none" | "line" | "all";
}

export interface TreeViewSettings {
  indentPx: number;
  fontSize: number;
  defaultExpandDepth: number;
  showChildCount: boolean;
  stringTruncateLength: number;
}

export interface FormatSettings {
  beautifyIndent: number;
  sortKeysOnBeautify: boolean;
}

export interface AppSettings {
  editor: EditorSettings;
  treeView: TreeViewSettings;
  format: FormatSettings;
}

const DEFAULT_EDITOR: EditorSettings = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  lineNumbers: "on",
  wordWrap: "on",
  tabSize: 2,
  minimap: false,
  bracketPairColorization: true,
  paddingTop: 12,
  renderLineHighlight: "line",
};

const DEFAULT_TREE: TreeViewSettings = {
  indentPx: 18,
  fontSize: 13,
  defaultExpandDepth: 3,
  showChildCount: true,
  stringTruncateLength: 120,
};

const DEFAULT_FORMAT: FormatSettings = {
  beautifyIndent: 2,
  sortKeysOnBeautify: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  editor: DEFAULT_EDITOR,
  treeView: DEFAULT_TREE,
  format: DEFAULT_FORMAT,
};

const IDB_KEY = "json-prism-settings-v1";
const LEGACY_LS_KEY = "json-prism-settings";

function mergePartial(parsed: Partial<AppSettings>): AppSettings {
  return deepMerge(DEFAULT_SETTINGS, parsed);
}

export async function loadSettings(): Promise<AppSettings> {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const fromIdb = await idbGet<AppSettings>(IDB_KEY);
    if (fromIdb && typeof fromIdb === "object") {
      return mergePartial(fromIdb as Partial<AppSettings>);
    }

    const raw = localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const merged = mergePartial(parsed);
    await idbSet(IDB_KEY, merged);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const out = { ...target } as Record<string, unknown>;
  for (const k of Object.keys(source) as (keyof T)[]) {
    const v = source[k];
    if (v === undefined) continue;
    const key = String(k);
    if (typeof v === "object" && v !== null && !Array.isArray(v) && typeof target[k] === "object") {
      out[key] = deepMerge(target[k] as object, v as Partial<object>);
    } else {
      out[key] = v;
    }
  }
  return out as T;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await idbSet(IDB_KEY, settings);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}

// Font family options for editor
export const FONT_FAMILIES = [
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Fira Code', 'Fira Mono', monospace", label: "Fira Code" },
  { value: "'Cascadia Code', 'Cascadia Mono', monospace", label: "Cascadia Code" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'Monaco', 'Menlo', monospace", label: "Monaco / Menlo" },
  { value: "'Consolas', 'Courier New', monospace", label: "Consolas" },
  { value: "ui-monospace, monospace", label: "System Mono" },
] as const;
