"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, Braces, Brackets } from "lucide-react";

import type { TreeViewSettings } from "@/lib/settings";

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

function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm) return text;
  const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-foreground rounded px-0.5">
        {text.slice(idx, idx + searchTerm.length)}
      </mark>
      {text.slice(idx + searchTerm.length)}
    </>
  );
}

function TreeRow({
  row,
  onToggle,
  searchTerm,
  indentPx,
  fontSize,
  showChildCount,
  stringTruncateLength,
}: {
  row: FlatRow;
  onToggle: (id: string) => void;
  searchTerm?: string;
  indentPx: number;
  fontSize: number;
  showChildCount: boolean;
  stringTruncateLength: number;
}) {
  const indent = row.depth * indentPx;

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
          "{searchTerm ? highlightText(display, searchTerm) : display}"
        </span>
      );
    }

    return (
      <div
        className="flex items-center gap-1 py-[2px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-colors font-mono"
        style={{ marginLeft: indent, fontSize }}
      >
        {row.keyName !== undefined && (
          <span className="text-json-key shrink-0">
            "{searchTerm ? highlightText(row.keyName, searchTerm) : row.keyName}"
            <span className="text-json-bracket">: </span>
          </span>
        )}
        {valueEl}
      </div>
    );
  }

  // Expandable
  const isArray = row.isArray;
  const bracket = isArray ? ["[", "]"] : ["{", "}"];
  const TypeIcon = isArray ? Brackets : Braces;

  return (
    <div style={{ marginLeft: indent }}>
      <button
        onClick={() => onToggle(row.id)}
        className="flex items-center gap-1.5 py-[2px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-all duration-100 w-full text-left font-mono"
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
            "{searchTerm ? highlightText(row.keyName, searchTerm) : row.keyName}"
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
    </div>
  );
}

export default function JsonTreeView({ data, expandAll, searchTerm, treeSettings }: JsonTreeViewProps) {
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

  const rows = useMemo(() => {
    if (data === null || data === undefined) return [];
    return buildRows(data, expanded, 0, undefined, "root");
  }, [data, expanded]);

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

  if (data === null || data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
          <Braces className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No JSON to display</p>
          <p className="text-xs mt-1">Paste or upload JSON to see the tree view</p>
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
              searchTerm={searchTerm}
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
