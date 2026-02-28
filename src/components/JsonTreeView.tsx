import { useState, useCallback, memo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface JsonTreeViewProps {
  data: unknown;
  expandAll?: boolean;
}

export default function JsonTreeView({ data, expandAll }: JsonTreeViewProps) {
  if (data === null || data === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono">
        Paste or upload JSON to see tree view
      </div>
    );
  }

  return (
    <div className="p-3 font-mono text-[13px] overflow-auto h-full">
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
  const [expanded, setExpanded] = useState(() => expandAll ?? depth < 2);

  // Sync with expandAll prop changes
  const toggleExpanded = useCallback(() => setExpanded((e) => !e), []);

  if (value === null) {
    return (
      <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}: </span>}
        <span className="text-json-null italic">null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}: </span>}
        <span className="text-json-boolean">{String(value)}</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}: </span>}
        <span className="text-json-number">{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 }}>
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}: </span>}
        <span className="text-json-string truncate max-w-md" title={value}>
          "{value}"
        </span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);

  const bracket = isArray ? ["[", "]"] : ["{", "}"];
  const count = entries.length;

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-1 py-0.5 hover:bg-accent/30 rounded px-1 -ml-1 transition-colors w-full text-left"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        {keyName !== undefined && <span className="text-json-key">{`"${keyName}"`}: </span>}
        <span className="text-json-bracket">{bracket[0]}</span>
        {!expanded && (
          <span className="text-muted-foreground text-xs ml-1">
            {count} {count === 1 ? "item" : "items"}
          </span>
        )}
        {!expanded && <span className="text-json-bracket">{bracket[1]}</span>}
      </button>
      {expanded && (
        <>
          {entries.map(([k, v]) => (
            <TreeNode key={k} keyName={isArray ? undefined : k} value={v} expandAll={expandAll} depth={depth + 1} />
          ))}
          <div className="py-0.5 text-json-bracket" style={{ paddingLeft: 0 }}>
            {bracket[1]}
          </div>
        </>
      )}
    </div>
  );
});
