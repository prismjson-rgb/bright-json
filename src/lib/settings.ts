/**
 * User-editable JSON editor & viewer settings.
 * Persisted in localStorage; all keys prefixed with json-prism-settings-
 */

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

const STORAGE_KEY = "json-prism-settings";

function loadFromStorage(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return deepMerge(DEFAULT_SETTINGS, parsed);
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

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function loadSettings(): AppSettings {
  return loadFromStorage();
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
