import type { Edge, Node } from "@xyflow/react";
import dagre from "@dagrejs/dagre";

/** Cap graph size so huge payloads stay responsive. */
export const JSON_FLOW_MAX_NODES = 320;

export type PrimitiveType = "string" | "number" | "boolean" | "null";

export type JsonFlowNodeData = {
  label: string;
  /** Lines for grouped primitive-property nodes. */
  lines?: string[];
  /** Primitive type for each line in a grouped node. */
  lineTypes?: PrimitiveType[];
  /** Primitive type for standalone leaf nodes (e.g. array items). */
  primitiveType?: PrimitiveType;
  variant: "root" | "branch" | "leaf";
  /** Depth in the JSON tree (0 = root). */
  depth: number;
  /** Set for object/array container nodes. */
  containerKind?: "object" | "array";
};

export type JsonFlowEdgeData = {
  label?: string;
  kind: "key";
};

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function inferPrimitiveType(v: unknown): PrimitiveType {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return "number";
  return "string";
}

function pushEdge(
  edges: Edge[],
  parentId: string,
  targetId: string
): void {
  edges.push({
    id: `e-${parentId}-${targetId}`,
    source: parentId,
    target: targetId,
    type: "jsonFlow",
    data: { label: undefined, kind: "key" } satisfies JsonFlowEdgeData,
    zIndex: 0,
  });
}

/**
 * Turn parsed JSON into React Flow nodes and edges (tree-shaped).
 */
export function jsonToFlowElements(data: unknown): {
  nodes: Node<JsonFlowNodeData>[];
  edges: Edge[];
  truncated: boolean;
} {
  const nodes: Node<JsonFlowNodeData>[] = [];
  const edges: Edge[] = [];
  let truncated = false;
  let count = 0;
  let idSeq = 0;

  function addNode(
    label: string,
    variant: JsonFlowNodeData["variant"],
    depth: number,
    containerKind?: "object" | "array",
    lines?: string[],
    lineTypes?: PrimitiveType[],
    primitiveType?: PrimitiveType
  ): string | null {
    if (count >= JSON_FLOW_MAX_NODES) {
      truncated = true;
      return null;
    }
    count++;
    const id = `jf-${idSeq++}`;
    nodes.push({
      id,
      type: "json",
      position: { x: 0, y: 0 },
      data: { label, variant, depth, containerKind, lines, lineTypes, primitiveType },
    });
    return id;
  }

  function visit(
    value: unknown,
    parentId: string | null,
    edgeLabel: string | undefined,
    depth: number
  ): void {
    if (value === null || value === undefined) {
      // Only reached from array items (edgeLabel is always undefined here)
      const id = addNode(String(value), "leaf", depth, undefined, undefined, undefined, "null");
      if (id && parentId) pushEdge(edges, parentId, id);
      return;
    }

    if (typeof value !== "object") {
      // Only reached from array items (edgeLabel is always undefined here)
      const raw =
        typeof value === "string" ? JSON.stringify(value) : String(value);
      const id = addNode(truncate(raw, 56), "leaf", depth, undefined, undefined, undefined, inferPrimitiveType(value));
      if (id && parentId) pushEdge(edges, parentId, id);
      return;
    }

    if (Array.isArray(value)) {
      const inner = value.length === 0 ? "[]" : `[${value.length}]`;
      const header =
        edgeLabel !== undefined ? `${edgeLabel}: ${inner}` : inner;
      const id = addNode(parentId ? header : "Root", parentId ? "branch" : "root", depth, "array");
      if (!id) return;
      if (parentId) pushEdge(edges, parentId, id);
      value.forEach((item) => {
        if (truncated) return;
        visit(item, id, undefined, depth + 1);
      });
      return;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    const inner = entries.length === 0 ? "{}" : `{${entries.length}}`;
    const header =
      edgeLabel !== undefined ? `${edgeLabel}: ${inner}` : inner;
    const id = addNode(parentId ? header : "Root", parentId ? "branch" : "root", depth, "object");
    if (!id) return;
    if (parentId) pushEdge(edges, parentId, id);

    // Collect ALL primitive properties into one grouped node, containers keep their relative order.
    // The primitives group is inserted at the position of the first primitive in the original JSON.
    const primitiveEntries: [string, unknown][] = [];
    const outputOrder: Array<
      | { kind: "primitives" }
      | { kind: "container"; key: string; value: unknown }
    > = [];
    let primitivesSlotted = false;

    for (const [k, v] of entries) {
      if (v !== null && v !== undefined && typeof v === "object") {
        outputOrder.push({ kind: "container", key: k, value: v });
      } else {
        primitiveEntries.push([k, v]);
        if (!primitivesSlotted) {
          outputOrder.push({ kind: "primitives" });
          primitivesSlotted = true;
        }
      }
    }

    for (const item of outputOrder) {
      if (truncated) break;
      if (item.kind === "primitives") {
        const lines = primitiveEntries.map(([pk, pv]) => {
          const raw =
            pv === null || pv === undefined
              ? String(pv)
              : typeof pv === "string"
              ? JSON.stringify(pv)
              : String(pv);
          return `${pk}: ${truncate(raw, 52)}`;
        });
        const lineTypes = primitiveEntries.map(([, pv]) => inferPrimitiveType(pv));
        const leafId = addNode(lines[0], "leaf", depth + 1, undefined, lines, lineTypes);
        if (leafId) pushEdge(edges, id, leafId);
      } else {
        visit(item.value, id, item.key, depth + 1);
      }
    }
  }

  visit(data, null, undefined, 0);
  return { nodes, edges, truncated };
}

const NODE_W = 280;
const NODE_BASE_H = 68;
const NODE_LINE_H = 32;
const NODE_VPAD = 36;

function nodeHeight(n: Node<JsonFlowNodeData>): number {
  const lines = n.data.lines;
  if (lines && lines.length > 0) return NODE_VPAD + lines.length * NODE_LINE_H;
  return NODE_BASE_H;
}

/**
 * Apply Dagre layout (left → right, like many JSON graph previews).
 */
export function layoutFlowElements(
  nodes: Node<JsonFlowNodeData>[],
  edges: Edge[]
): Node<JsonFlowNodeData>[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: 40,
    ranksep: 110,
    marginx: 56,
    marginy: 40,
  });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: nodeHeight(n) }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_W / 2,
        y: pos.y - nodeHeight(node) / 2,
      },
    };
  });
}
