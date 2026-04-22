"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, Braces, Brackets, Copy, Check } from "lucide-react";

import type { TreeViewSettings } from "@/lib/settings";

/** Get the value at a path like "root", "root.foo", "root.items[0]", "root[0].name" */
function getValueAtPath(obj: unknown, path: string): unknown {
  if (path === "root") return obj;
  let current: unknown = obj;
  const rest = path.slice(4); // "root".length === 4
  if (!rest) return current;
  const re = /\.([^.[]+)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(rest)) !== null) {
    if (current === null || current === undefined) return undefined;
    if (m[1] !== undefined) {
      current = (current as Record<string, unknown>)[m[1]];
    } else {
      current = (current as unknown[])[Number(m[2])];
    }
  }
  return current;
}

// Defaults used when treeSettings not provided (e.g. BundleViewer)
const DEFAULT_TREE_SETTINGS: TreeViewSettings = {
  indentPx: 18,
  fontSize: 13,
  defaultExpandDepth: 3,
  showChildCount: true,
  stringTruncateLength: 120,
};

interface JsonTreeViewProps {
  data: unknown;
  expandAll?: boolean;
  searchTerm?: string;
  activeMatchPath?: string;
  treeSettings?: TreeViewSettings;
}

interface FlatRow {
  id: string;
  depth: number;
  keyName?: string;
  value: unknown;
  isExpandable: boolean;
  isExpanded: boolean;
  isClosingBracket: boolean;
  childCount?: number;
  isArray?: boolean;
}

function collectDefaultExpanded(
  data: unknown,
  path: string,
  depth: number,
  maxDepth: number,
  result: Set<string>
) {
  if (depth >= maxDepth || data === null || typeof data !== "object") return;
  result.add(path);
  const entries = Array.isArray(data)
    ? (data as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(data as Record<string, unknown>);
  for (const [k, v] of entries) {
    const childPath = Array.isArray(data) ? `${path}[${k}]` : `${path}.${k}`;
    collectDefaultExpanded(v, childPath, depth + 1, maxDepth, result);
  }
}

function buildRows(
  data: unknown,
  expanded: Set<string>,
  depth: number,
  keyName: string | undefined,
  path: string
): FlatRow[] {
  if (data === null || (typeof data !== "object")) {
    return [
      {
        id: path,
        depth,
        keyName,
        value: data,
        isExpandable: false,
        isExpanded: false,
        isClosingBracket: false,
      },
    ];
  }

  const isArray = Array.isArray(data);
  const entries: [string, unknown][] = isArray
    ? (data as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(data as Record<string, unknown>);

  const isExpanded = expanded.has(path);

  const openRow: FlatRow = {
    id: path,
    depth,
    keyName,
    value: data,
    isExpandable: true,
    isExpanded,
    isClosingBracket: false,
    childCount: entries.length,
    isArray,
  };

  if (!isExpanded || entries.length === 0) return [openRow];

  const rows: FlatRow[] = [openRow];
  for (const [k, v] of entries) {
    const childPath = isArray ? `${path}[${k}]` : `${path}.${k}`;
    rows.push(...buildRows(v, expanded, depth + 1, isArray ? undefined : k, childPath));
  }
  rows.push({
    id: `${path}.__close`,
    depth,
    value: isArray ? "]" : "}",
    isExpandable: false,
    isExpanded: false,
    isClosingBracket: true,
  });

  return rows;
}

function getAncestorPaths(path: string): string[] {
  if (path === "root") return [];
  const ancestors: string[] = ["root"];
  const rest = path.slice(4);
  const re = /\.([^.[]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  let built = "root";
  const segments: string[] = [];
  while ((m = re.exec(rest)) !== null) segments.push(m[0]);
  for (let i = 0; i < segments.length - 1; i++) {
    built += segments[i];
    ancestors.push(built);
  }
  return ancestors;
}

function highlightText(text: string, searchTerm: string, isActive = false): React.ReactNode {
  if (!searchTerm) return text;
  const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={isActive ? "bg-primary text-primary-foreground rounded px-0.5" : "bg-primary/30 text-foreground rounded px-0.5"}>
        {text.slice(idx, idx + searchTerm.length)}
      </mark>
      {text.slice(idx + searchTerm.length)}
    </>
  );
}

function TreeRow({
  row,
  onToggle,
  onCopyValue,
  onCopyBranch,
  copiedPath,
  searchTerm,
  activeMatchPath,
  indentPx,
  fontSize,
  showChildCount,
  stringTruncateLength,
}: {
  row: FlatRow;
  onToggle: (id: string) => void;
  onCopyValue: (path: string, value: unknown) => void;
  onCopyBranch: (path: string) => void;
  copiedPath: string | null;
  searchTerm?: string;
  activeMatchPath?: string;
  indentPx: number;
  fontSize: number;
  showChildCount: boolean;
  stringTruncateLength: number;
}) {
  const indent = row.depth * indentPx;
  const isCopied = copiedPath === row.id;
  const isActive = !!activeMatchPath && row.id === activeMatchPath;

  if (row.isClosingBracket) {
    return (
      <div
        className="flex items-center py-[2px] px-2 font-mono"
        style={{ paddingLeft: indent + 8, fontSize }}
      >
        <span className="text-json-bracket font-medium">{String(row.value)}</span>
      </div>
    );
  }

  if (!row.isExpandable) {
    const val = row.value;
    let valueEl: React.ReactNode;
    if (val === null) {
      valueEl = <span className="text-json-null italic font-medium">null</span>;
    } else if (typeof val === "boolean") {
      valueEl = <span className="text-json-boolean font-medium">{String(val)}</span>;
    } else if (typeof val === "number") {
      valueEl = <span className="text-json-number font-medium">{val}</span>;
    } else {
      const str = String(val);
      const display = str.length > stringTruncateLength ? str.slice(0, stringTruncateLength) + "…" : str;
      valueEl = (
        <span className="text-json-string" title={str}>
          "{searchTerm ? highlightText(display, searchTerm, isActive) : display}"
        </span>
      );
    }

    return (
      <div
        className={`group flex items-center gap-1 py-[2px] rounded-md px-2 -mx-2 transition-colors font-mono ${isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-secondary/40"}`}
        style={{ marginLeft: indent, fontSize }}
      >
        {row.keyName !== undefined && (
          <span className="text-json-key shrink-0">
            "{searchTerm ? highlightText(row.keyName, searchTerm, isActive) : row.keyName}"
            <span className="text-json-bracket">: </span>
          </span>
        )}
        {valueEl}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyValue(row.id, row.value);
          }}
          className="ml-1 shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-opacity"
          title="Copy value"
          aria-label="Copy value"
        >
          {isCopied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // Expandable branch/node
  const isArray = row.isArray;
  const bracket = isArray ? ["[", "]"] : ["{", "}"];
  const TypeIcon = isArray ? Brackets : Braces;

  return (
    <div className={`group flex items-center gap-0.5 w-fit ${isActive ? "rounded-md ring-1 ring-primary/30 bg-primary/10" : ""}`} style={{ marginLeft: indent }}>
      <button
        onClick={() => onToggle(row.id)}
        className="flex items-center gap-1.5 py-[2px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-all duration-100 text-left font-mono"
        style={{ fontSize }}
      >
        <span
          className="text-muted-foreground/70 transition-transform duration-150 shrink-0"
          style={{ transform: row.isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </span>
        {row.keyName !== undefined && (
          <span className="text-json-key shrink-0">
            "{searchTerm ? highlightText(row.keyName, searchTerm, isActive) : row.keyName}"
            <span className="text-json-bracket">: </span>
          </span>
        )}
        <span className="text-json-bracket font-medium">{bracket[0]}</span>
        {!row.isExpanded && (
          <>
            {showChildCount && (
              <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px] bg-secondary/60 px-1.5 py-0.5 rounded-md">
                <TypeIcon className="w-3 h-3" />
                {row.childCount}
              </span>
            )}
            <span className="text-json-bracket font-medium">{bracket[1]}</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopyBranch(row.id);
        }}
        className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-opacity"
        title={row.id === "root" ? "Copy entire JSON" : "Copy this section"}
        aria-label={row.id === "root" ? "Copy entire JSON" : "Copy this section"}
      >
        {isCopied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

export default function JsonTreeView({ data, expandAll, searchTerm, activeMatchPath, treeSettings }: JsonTreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ts = treeSettings ?? DEFAULT_TREE_SETTINGS;

  // Initialize expanded set with defaultExpandDepth
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (data !== null && data !== undefined) {
      collectDefaultExpanded(data, "root", 0, ts.defaultExpandDepth, set);
    }
    return set;
  });

  // Handle expandAll prop changes
  useEffect(() => {
    if (expandAll === undefined) return;
    if (expandAll) {
      const set = new Set<string>();
      collectDefaultExpanded(data, "root", 0, Infinity, set);
      setExpanded(set);
    } else {
      setExpanded(new Set());
    }
  }, [expandAll, data]);

  // Reset when data changes fundamentally (new JSON loaded)
  const prevDataRef = useRef(data);
  useEffect(() => {
    if (prevDataRef.current !== data) {
      prevDataRef.current = data;
      const set = new Set<string>();
      if (data !== null && data !== undefined) {
        collectDefaultExpanded(data, "root", 0, ts.defaultExpandDepth, set);
      }
      setExpanded(set);
    }
  }, [data, ts.defaultExpandDepth]);

  // Auto-expand ancestors of activeMatchPath and scroll to it
  useEffect(() => {
    if (!activeMatchPath) return;
    const ancestors = getAncestorPaths(activeMatchPath);
    if (ancestors.length > 0) {
      setExpanded((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const a of ancestors) {
          if (!next.has(a)) { next.add(a); changed = true; }
        }
        return changed ? next : prev;
      });
    }
  }, [activeMatchPath]);

  const rows = useMemo(() => {
    if (data === null || data === undefined) return [];
    return buildRows(data, expanded, 0, undefined, "root");
  }, [data, expanded]);

  // Scroll to active match after rows settle
  useEffect(() => {
    if (!activeMatchPath) return;
    const idx = rows.findIndex((r) => r.id === activeMatchPath);
    if (idx !== -1) {
      virtualizer.scrollToIndex(idx, { align: "center", behavior: "smooth" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatchPath, rows]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 26,
    overscan: 20,
  });

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback((text: string): boolean => {
    if (typeof navigator?.clipboard?.writeText !== "function") return false;
    navigator.clipboard.writeText(text).catch(() => {});
    return true;
  }, []);

  const handleCopyValue = useCallback(
    (path: string, value: unknown) => {
      const text =
        typeof value === "string"
          ? value
          : JSON.stringify(value);
      if (copyToClipboard(text)) {
        setCopiedPath(path);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => {
          setCopiedPath(null);
          copiedTimeoutRef.current = null;
        }, 1500);
      }
    },
    [copyToClipboard]
  );

  const handleCopyBranch = useCallback(
    (path: string) => {
      const value = getValueAtPath(data, path);
      const text = JSON.stringify(value, null, 2);
      if (copyToClipboard(text)) {
        setCopiedPath(path);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => {
          setCopiedPath(null);
          copiedTimeoutRef.current = null;
        }, 1500);
      }
    },
    [data, copyToClipboard]
  );

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  if (data === null || data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
          <Braces className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No JSON to display</p>
          <p className="text-xs mt-1 max-w-[16rem]">
            Paste JSON, Import, From URL, or drop a .json file on the editor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-auto">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
        className="p-4"
      >
        {virtualizer.getVirtualItems().map((vItem) => {
          const row = rows[vItem.index];
          return (
            <div
              key={row.id}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vItem.start}px)`,
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <TreeRow
                row={row}
                onToggle={handleToggle}
                onCopyValue={handleCopyValue}
                onCopyBranch={handleCopyBranch}
                copiedPath={copiedPath}
                searchTerm={searchTerm}
                activeMatchPath={activeMatchPath}
                indentPx={ts.indentPx}
                fontSize={ts.fontSize}
                showChildCount={ts.showChildCount}
                stringTruncateLength={ts.stringTruncateLength}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
