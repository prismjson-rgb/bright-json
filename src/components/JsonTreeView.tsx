import { useState, useCallback, memo, useEffect } from "react";
import { ChevronRight, ChevronDown, Braces, Brackets } from "lucide-react";

interface JsonTreeViewProps {
  data: unknown;
  expandAll?: boolean;
}

export default function JsonTreeView({ data, expandAll }: JsonTreeViewProps) {
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
    <div className="p-4 font-mono text-[13px] leading-relaxed overflow-auto h-full animate-fade-in">
      <TreeNode value={data} expandAll={expandAll} depth={0} />
    </div>
  );
}

const TreeNode = memo(function TreeNode({
  keyName,
  value,
  expandAll,
  depth,
}: {
  keyName?: string;
  value: unknown;
  expandAll?: boolean;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(() => expandAll ?? depth < 3);

  useEffect(() => {
    if (expandAll !== undefined) setExpanded(expandAll);
  }, [expandAll]);

  const toggleExpanded = useCallback(() => setExpanded((e) => !e), []);

  const indent = depth * 20;

  // Primitive values
  if (value === null) {
    return (
      <div className="flex items-center gap-1 py-[3px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-colors" style={{ marginLeft: indent }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}<span className="text-json-bracket">: </span></span>}
        <span className="text-json-null italic font-medium">null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center gap-1 py-[3px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-colors" style={{ marginLeft: indent }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}<span className="text-json-bracket">: </span></span>}
        <span className="text-json-boolean font-medium">{String(value)}</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="flex items-center gap-1 py-[3px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-colors" style={{ marginLeft: indent }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}<span className="text-json-bracket">: </span></span>}
        <span className="text-json-number font-medium">{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div className="flex items-center gap-1 py-[3px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-colors" style={{ marginLeft: indent }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}<span className="text-json-bracket">: </span></span>}
        <span className="text-json-string" title={value}>
          "{value.length > 120 ? value.slice(0, 120) + "…" : value}"
        </span>
      </div>
    );
  }

  // Objects / Arrays
  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);

  const bracket = isArray ? ["[", "]"] : ["{", "}"];
  const count = entries.length;
  const TypeIcon = isArray ? Brackets : Braces;

  return (
    <div style={{ marginLeft: indent }}>
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-1.5 py-[3px] hover:bg-secondary/40 rounded-md px-2 -mx-2 transition-all duration-100 w-full text-left group"
      >
        <span className="text-muted-foreground/70 transition-transform duration-150 shrink-0" style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </span>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}<span className="text-json-bracket">: </span></span>}
        <span className="text-json-bracket font-medium">{bracket[0]}</span>
        {!expanded && (
          <>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px] bg-secondary/60 px-1.5 py-0.5 rounded-md">
              <TypeIcon className="w-3 h-3" />
              {count}
            </span>
            <span className="text-json-bracket font-medium">{bracket[1]}</span>
          </>
        )}
      </button>
      {expanded && (
        <div className="border-l border-border/50 ml-[7px]">
          {entries.map(([k, v]) => (
            <TreeNode key={k} keyName={isArray ? undefined : k} value={v} expandAll={expandAll} depth={1} />
          ))}
          <div className="py-[3px] text-json-bracket font-medium px-2">
            {bracket[1]}
          </div>
        </div>
      )}
    </div>
  );
});
