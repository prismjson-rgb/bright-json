"use client";

import { memo, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  jsonToFlowElements,
  layoutFlowElements,
  type JsonFlowNodeData,
  type PrimitiveType,
} from "@/lib/json-to-flow";

import JsonFlowEdge from "@/components/JsonFlowEdge";

// ─── Type badge ────────────────────────────────────────────────────────────────

const TYPE_CONFIGS: Record<string, { symbol: string; cls: string }> = {
  root:    { symbol: ">./", cls: "bg-primary/10 text-primary border-primary/40" },
  object:  { symbol: "{ }", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40" },
  array:   { symbol: "[ ]", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40" },
  string:  { symbol: '" "', cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40" },
  number:  { symbol: " # ", cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/40" },
  boolean: { symbol: "T/F", cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40" },
  null:    { symbol: "nil", cls: "bg-zinc-400/15 text-zinc-500 border-zinc-400/40" },
};

function TypeBadge({ kind }: { kind: string }) {
  const cfg = TYPE_CONFIGS[kind] ?? TYPE_CONFIGS.null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 w-[38px] rounded-md border px-1 py-1 text-[11px] font-bold font-mono leading-none tracking-tight select-none",
        cfg.cls
      )}
    >
      {cfg.symbol}
    </span>
  );
}

// ─── Node ───────────────────────────────────────────────────────────────────

const JsonNode = memo(function JsonNode({ data }: NodeProps) {
  const d = data as JsonFlowNodeData;
  const ck = d.containerKind;
  const isLeaf = d.variant === "leaf";

  const badgeKind =
    d.variant === "root" ? "root" :
    ck ? ck :
    (d.primitiveType as string | undefined) ?? "null";

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3.5 !w-3.5 !border-2 !border-border/70 !bg-background !shadow"
        aria-label="Incoming"
      />
      <div
        className={cn(
          "rounded-2xl border-2 font-mono shadow-xl transition-shadow max-w-[min(280px,88vw)] text-left",
          d.variant === "root" &&
            "bg-primary/[0.08] border-primary/50 shadow-primary/10",
          d.variant === "branch" && ck === "object" &&
            "bg-emerald-500/[0.06] border-emerald-600/45 dark:border-emerald-500/35 shadow-emerald-500/5",
          d.variant === "branch" && ck === "array" &&
            "bg-sky-500/[0.06] border-sky-500/45 dark:border-sky-400/35 shadow-sky-500/5",
          isLeaf &&
            "bg-card border-border/70",
        )}
        title={d.label}
      >
        {d.lines && d.lines.length > 0 ? (
          // Grouped primitive properties — one row per property
          <div className="px-4 py-3 space-y-2.5">
            {d.lines.map((line, i) => {
              const pt: PrimitiveType = d.lineTypes?.[i] ?? "null";
              // Split into key and value for cleaner display
              const colonIdx = line.indexOf(": ");
              const key = colonIdx !== -1 ? line.slice(0, colonIdx) : line;
              const val = colonIdx !== -1 ? line.slice(colonIdx + 2) : "";
              return (
                <div key={i} className="flex items-center gap-3 min-w-0">
                  <TypeBadge kind={pt} />
                  <div className="min-w-0 leading-snug">
                    <span className="text-[13px] font-semibold text-foreground/70 break-all">{key}</span>
                    {val && (
                      <>
                        <span className="text-[13px] text-muted-foreground mx-1">:</span>
                        <span className="text-[13px] text-foreground break-all">{val}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Branch or single-value node
          <div className="flex items-center gap-3 px-4 py-3.5">
            <TypeBadge kind={badgeKind} />
            <span className="text-[15px] font-semibold leading-snug break-all line-clamp-2 text-foreground">
              {d.label}
            </span>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3.5 !w-3.5 !border-2 !border-border/70 !bg-background !shadow"
        aria-label="Outgoing"
      />
    </div>
  );
});

const nodeTypes = { json: JsonNode };
const edgeTypes = { jsonFlow: JsonFlowEdge };

function FlowFitView({ allNodes, nodeCount }: { allNodes: Node[]; nodeCount: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (nodeCount === 0) return;
    // Focus initial view on root + its direct children for a zoomed-in starting point
    const focusNodes = allNodes.filter(
      (n) => (n.data as JsonFlowNodeData).depth <= 1
    );
    const t = requestAnimationFrame(() => {
      fitView({
        nodes: focusNodes.length > 0 ? focusNodes : undefined,
        padding: 0.3,
        duration: 320,
        maxZoom: 1.5,
      });
    });
    return () => cancelAnimationFrame(t);
  }, [nodeCount, fitView, allNodes]);
  return null;
}

interface JsonFlowViewProps {
  parsed: unknown | null;
  dark: boolean;
}

function JsonFlowCanvas({ parsed, dark }: JsonFlowViewProps) {
  const { nodes: nextNodes, edges: nextEdges, truncated } = useMemo(() => {
    if (parsed === null) {
      return { nodes: [], edges: [] as Edge[], truncated: false };
    }
    const built = jsonToFlowElements(parsed);
    const laid = layoutFlowElements(built.nodes, built.edges);
    return { nodes: laid, edges: built.edges, truncated: built.truncated };
  }, [parsed]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nextNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(nextEdges);

  useEffect(() => {
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [nextNodes, nextEdges, setNodes, setEdges]);

  if (parsed === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-muted-foreground p-6">
        <AlertCircle className="w-10 h-10 opacity-35" />
        <p className="text-sm text-center">Enter valid JSON in the editor to see the graph</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-2 text-muted-foreground p-6">
        <p className="text-sm">Nothing to display</p>
      </div>
    );
  }

  return (
    <div className={cn("json-flow-canvas h-full w-full min-h-[280px]", dark && "dark")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.05}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "jsonFlow",
          interactionWidth: 24,
        }}
        elevateEdgesOnSelect
        className="bg-surface2"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color={dark ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.18)"}
        />
        <Controls className="!border-border !bg-background/90 !shadow-md" />
        <MiniMap
          zoomable
          pannable
          className="!bg-muted/85 !border-border rounded-lg shadow-md"
          maskColor={dark ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.65)"}
          nodeColor={(n) => {
            if (n.type !== "json") return "#94a3b8";
            const d = n.data as JsonFlowNodeData;
            if (d.variant === "leaf") return dark ? "#64748b" : "#94a3b8";
            if (d.containerKind === "array") return dark ? "#0ea5e9" : "#38bdf8";
            if (d.containerKind === "object") return dark ? "#10b981" : "#34d399";
            return dark ? "#2dd4bf" : "#14b8a6";
          }}
        />
        <FlowFitView allNodes={nodes} nodeCount={nodes.length} />
        {truncated && (
          <Panel position="top-center" className="m-2">
            <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-800 dark:text-amber-200/90 max-w-[min(420px,92vw)] text-center leading-snug">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Graph truncated — document is very large. Collapse data or use Tree view.
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default function JsonFlowView(props: JsonFlowViewProps) {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-full min-h-0 flex-1">
        <JsonFlowCanvas {...props} />
      </div>
    </ReactFlowProvider>
  );
}
