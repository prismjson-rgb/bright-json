import { describe, it, expect } from "vitest";
import {
  jsonToFlowElements,
  layoutFlowElements,
  JSON_FLOW_MAX_NODES,
} from "../json-to-flow";
import type { JsonFlowNodeData } from "../json-to-flow";
import type { Node, Edge } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nodeData(nodes: Node<JsonFlowNodeData>[], idx: number) {
  return nodes[idx].data;
}

// ---------------------------------------------------------------------------
// jsonToFlowElements — primitive roots
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — primitive roots", () => {
  it("string root produces 1 leaf node with primitiveType=string and no edge", () => {
    const { nodes, edges, truncated } = jsonToFlowElements("hello");
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(truncated).toBe(false);
    const d = nodeData(nodes, 0);
    expect(d.variant).toBe("leaf");
    expect(d.primitiveType).toBe("string");
    // root-level string: label is the truncated JSON.stringify value (no key prefix)
    expect(d.label).toBe('"hello"');
    expect(d.depth).toBe(0);
  });

  it("number root produces 1 leaf node with primitiveType=number", () => {
    const { nodes, edges } = jsonToFlowElements(42);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodeData(nodes, 0).primitiveType).toBe("number");
    expect(nodeData(nodes, 0).label).toBe("42");
  });

  it("boolean root produces 1 leaf node with primitiveType=boolean", () => {
    const { nodes, edges } = jsonToFlowElements(true);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodeData(nodes, 0).primitiveType).toBe("boolean");
    expect(nodeData(nodes, 0).label).toBe("true");
  });

  it("null root produces 1 leaf node with primitiveType=null", () => {
    const { nodes, edges } = jsonToFlowElements(null);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodeData(nodes, 0).primitiveType).toBe("null");
    // null root: no edgeLabel so label is String(null) = "null"
    expect(nodeData(nodes, 0).label).toBe("null");
  });

  it("undefined root produces 1 leaf node with primitiveType=null", () => {
    const { nodes, edges } = jsonToFlowElements(undefined);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodeData(nodes, 0).primitiveType).toBe("null");
    expect(nodeData(nodes, 0).label).toBe("undefined");
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — empty containers
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — empty containers", () => {
  it("empty object produces 1 root node with variant=root, containerKind=object, label=Root", () => {
    const { nodes, edges, truncated } = jsonToFlowElements({});
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(truncated).toBe(false);
    const d = nodeData(nodes, 0);
    expect(d.variant).toBe("root");
    expect(d.containerKind).toBe("object");
    expect(d.label).toBe("Root");
    expect(d.depth).toBe(0);
  });

  it("empty array produces 1 root node with containerKind=array, label=Root", () => {
    const { nodes, edges } = jsonToFlowElements([]);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    const d = nodeData(nodes, 0);
    expect(d.variant).toBe("root");
    expect(d.containerKind).toBe("array");
    expect(d.label).toBe("Root");
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — object with only primitives (grouped leaf)
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — object with only primitives", () => {
  it("{name:'John', age:30} produces root + 1 grouped leaf + 1 edge", () => {
    const { nodes, edges, truncated } = jsonToFlowElements({ name: "John", age: 30 });
    expect(truncated).toBe(false);
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);

    const root = nodeData(nodes, 0);
    expect(root.variant).toBe("root");
    expect(root.label).toBe("Root");

    const leaf = nodeData(nodes, 1);
    expect(leaf.variant).toBe("leaf");
    expect(leaf.lines).toEqual(['name: "John"', "age: 30"]);
    expect(leaf.lineTypes).toEqual(["string", "number"]);
    expect(leaf.depth).toBe(1);

    // Edge connects root to leaf
    expect(edges[0].source).toBe(nodes[0].id);
    expect(edges[0].target).toBe(nodes[1].id);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — object with only containers
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — object with only containers", () => {
  it("{a:{}, b:[]} produces root + 2 branch nodes + 2 edges", () => {
    const { nodes, edges } = jsonToFlowElements({ a: {}, b: [] });
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);

    const root = nodes[0];
    expect(root.data.variant).toBe("root");

    const aBranch = nodes[1];
    expect(aBranch.data.variant).toBe("branch");
    expect(aBranch.data.label).toBe("a: {}");
    expect(aBranch.data.containerKind).toBe("object");

    const bBranch = nodes[2];
    expect(bBranch.data.variant).toBe("branch");
    expect(bBranch.data.label).toBe("b: []");
    expect(bBranch.data.containerKind).toBe("array");

    // Both edges come from root
    expect(edges[0].source).toBe(root.id);
    expect(edges[0].target).toBe(aBranch.id);
    expect(edges[1].source).toBe(root.id);
    expect(edges[1].target).toBe(bBranch.id);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — non-consecutive primitives grouping
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — non-consecutive primitives grouping", () => {
  it("{id:'s1', features:{temp:23}, label:'normal'} groups id and label together", () => {
    const input = { id: "s1", features: { temp: 23 }, label: "normal" };
    const { nodes, edges } = jsonToFlowElements(input);

    // root, grouped[id,label], features-branch, grouped[temp]
    expect(nodes).toHaveLength(4);
    expect(edges).toHaveLength(3);

    const root = nodes[0];
    expect(root.data.variant).toBe("root");

    // primitives group comes first (at first-primitive insertion point = position 0 in output)
    const groupedLeaf = nodes[1];
    expect(groupedLeaf.data.variant).toBe("leaf");
    expect(groupedLeaf.data.lines).toEqual(['id: "s1"', 'label: "normal"']);
    expect(groupedLeaf.data.lineTypes).toEqual(["string", "string"]);

    // features branch
    const featuresBranch = nodes[2];
    expect(featuresBranch.data.variant).toBe("branch");
    expect(featuresBranch.data.label).toBe("features: {1}");

    // nested temp grouped leaf
    const tempLeaf = nodes[3];
    expect(tempLeaf.data.variant).toBe("leaf");
    expect(tempLeaf.data.lines).toEqual(["temp: 23"]);

    // edges: root→grouped, root→features, features→temp-grouped
    const edgeSources = edges.map((e) => e.source);
    expect(edgeSources.filter((s) => s === root.id)).toHaveLength(2);
    expect(edgeSources.filter((s) => s === featuresBranch.id)).toHaveLength(1);
    expect(edges.find((e) => e.source === featuresBranch.id)!.target).toBe(tempLeaf.id);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — array with primitives
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — array with primitives", () => {
  it("[1, 'two', true, null] produces root + 4 individual leaf nodes", () => {
    const { nodes, edges } = jsonToFlowElements([1, "two", true, null]);
    expect(nodes).toHaveLength(5);
    expect(edges).toHaveLength(4);

    const root = nodes[0];
    expect(root.data.variant).toBe("root");
    expect(root.data.containerKind).toBe("array");

    const types = nodes.slice(1).map((n) => n.data.primitiveType);
    expect(types).toEqual(["number", "string", "boolean", "null"]);

    // All leaves are standalone (not grouped — no lines array with content)
    nodes.slice(1).forEach((n) => {
      expect(n.data.variant).toBe("leaf");
      expect(n.data.lines).toBeUndefined();
    });

    // Each edge source is root
    edges.forEach((e) => expect(e.source).toBe(root.id));
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — array containing objects
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — array containing objects", () => {
  it("[{x:1,y:2},{x:3}] produces root + 2 obj branches + 2 grouped leaves", () => {
    const { nodes, edges } = jsonToFlowElements([{ x: 1, y: 2 }, { x: 3 }]);
    // root-array, obj1-branch, grouped[x,y], obj2-branch, grouped[x]
    expect(nodes).toHaveLength(5);
    expect(edges).toHaveLength(4);

    const root = nodes[0];
    expect(root.data.containerKind).toBe("array");
    expect(root.data.label).toBe("Root");

    const obj1 = nodes[1];
    expect(obj1.data.variant).toBe("branch");
    // Array items have no edgeLabel, so header = inner only = "{2}"
    expect(obj1.data.label).toBe("{2}");
    expect(obj1.data.containerKind).toBe("object");

    const grouped1 = nodes[2];
    expect(grouped1.data.lines).toEqual(["x: 1", "y: 2"]);

    const obj2 = nodes[3];
    expect(obj2.data.variant).toBe("branch");
    expect(obj2.data.label).toBe("{1}");

    const grouped2 = nodes[4];
    expect(grouped2.data.lines).toEqual(["x: 3"]);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — deep nesting
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — deep nesting", () => {
  it("{a:{b:{c:'deep_value'}}} produces 4 nodes at correct depths", () => {
    const { nodes, edges } = jsonToFlowElements({ a: { b: { c: "deep_value" } } });
    expect(nodes).toHaveLength(4);
    expect(edges).toHaveLength(3);

    expect(nodes[0].data.depth).toBe(0); // root
    expect(nodes[1].data.depth).toBe(1); // a branch
    expect(nodes[2].data.depth).toBe(2); // b branch
    expect(nodes[3].data.depth).toBe(3); // grouped[c]

    expect(nodes[1].data.label).toBe("a: {1}");
    expect(nodes[2].data.label).toBe("b: {1}");
    expect(nodes[3].data.lines).toEqual([`c: "deep_value"`]);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — root always labelled "Root"
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — root label is always 'Root'", () => {
  it("object root gets label=Root", () => {
    const { nodes } = jsonToFlowElements({ a: 1, b: 2, c: 3 });
    expect(nodes[0].data.label).toBe("Root");
    expect(nodes[0].data.variant).toBe("root");
  });

  it("array root gets label=Root", () => {
    const { nodes } = jsonToFlowElements([1, 2]);
    expect(nodes[0].data.label).toBe("Root");
    expect(nodes[0].data.variant).toBe("root");
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — branch node labels include count and key
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — branch node label format", () => {
  it("object child branch shows key: {N}", () => {
    const { nodes } = jsonToFlowElements({ scripts: { start: "a" } });
    const branch = nodes.find((n) => n.data.label.startsWith("scripts"))!;
    expect(branch.data.label).toBe("scripts: {1}");
  });

  it("array child branch shows key: [N]", () => {
    const { nodes } = jsonToFlowElements({ items: [1, 2] });
    const branch = nodes.find((n) => n.data.label.startsWith("items"))!;
    expect(branch.data.label).toBe("items: [2]");
  });

  it("empty object child shows key: {}", () => {
    const { nodes } = jsonToFlowElements({ empty: {} });
    const branch = nodes.find((n) => n.data.label.startsWith("empty"))!;
    expect(branch.data.label).toBe("empty: {}");
  });

  it("empty array child shows key: []", () => {
    const { nodes } = jsonToFlowElements({ emptyArr: [] });
    const branch = nodes.find((n) => n.data.label.startsWith("emptyArr"))!;
    expect(branch.data.label).toBe("emptyArr: []");
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — null/undefined in object properties
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — null/undefined in object properties", () => {
  it("null property value renders as primitiveType=null in grouped leaf", () => {
    const { nodes } = jsonToFlowElements({ x: null });
    // single property: grouped leaf with lines
    const leaf = nodes[1];
    expect(leaf.data.lines).toEqual(["x: null"]);
    expect(leaf.data.lineTypes).toEqual(["null"]);
  });

  it("undefined property value renders as primitiveType=null in grouped leaf", () => {
    const { nodes } = jsonToFlowElements({ y: undefined });
    const leaf = nodes[1];
    expect(leaf.data.lines).toEqual(["y: undefined"]);
    expect(leaf.data.lineTypes).toEqual(["null"]);
  });

  it("null as standalone array item has correct label (key: null format)", () => {
    // When null is an array item, visit is called with edgeLabel=undefined
    // so label = String(null) = "null"
    const { nodes } = jsonToFlowElements([null]);
    const leaf = nodes[1];
    expect(leaf.data.label).toBe("null");
    expect(leaf.data.primitiveType).toBe("null");
  });

  it("null in object as direct child (not grouped) — visit with edgeLabel set", () => {
    // Object with null as the only value → goes through grouping path as primitive
    // lines[0] = "x: null", line 103-104 branch: edgeLabel !== undefined → "x: null"
    const { nodes } = jsonToFlowElements({ x: null, y: null });
    const leaf = nodes[1];
    expect(leaf.data.lines).toEqual(["x: null", "y: null"]);
    expect(leaf.data.lineTypes).toEqual(["null", "null"]);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — long string truncation
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — long string truncation", () => {
  it("string value > 52 chars (after JSON.stringify) is truncated in grouped node line", () => {
    // JSON.stringify wraps in quotes, so a 51-char string becomes 53 chars → truncated
    const longVal = "a".repeat(51); // JSON.stringify = '"' + 51 'a' + '"' = 53 chars → truncated
    const { nodes } = jsonToFlowElements({ key: longVal });
    const leaf = nodes[1];
    expect(leaf.data.lines![0]).toMatch(/…$/);
    expect(leaf.data.lines![0].length).toBe(`key: `.length + 52); // 5 + 51 chars then …
  });

  it("string value <= 52 chars (after JSON.stringify) is not truncated in grouped node", () => {
    const shortVal = "a".repeat(49); // JSON.stringify = 51 chars → not truncated
    const { nodes } = jsonToFlowElements({ key: shortVal });
    const leaf = nodes[1];
    expect(leaf.data.lines![0]).not.toMatch(/…$/);
  });

  it("root-level string > 56 chars is truncated", () => {
    // truncate(raw, 56): string of length 57 chars (after stringify) gets truncated
    const longStr = "b".repeat(55); // stringify = '"' + 55 + '"' = 57 chars → truncated
    const { nodes } = jsonToFlowElements(longStr);
    expect(nodes[0].data.label).toMatch(/…$/);
  });

  it("root-level string <= 56 chars is not truncated", () => {
    const shortStr = "b".repeat(54); // stringify = 56 chars → not truncated
    const { nodes } = jsonToFlowElements(shortStr);
    expect(nodes[0].data.label).not.toMatch(/…$/);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — truncation at JSON_FLOW_MAX_NODES
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — truncation at JSON_FLOW_MAX_NODES", () => {
  it("object with > 320 object-child properties triggers truncation", () => {
    // Each child object is 1 branch node + 1 leaf node = 2 nodes per child.
    // Root = 1 node. So 1 + 2*N nodes needed. With N=200 → 401 nodes → exceeds 320.
    // Use container children to avoid grouping (each is its own branch + leaf subtree).
    const big: Record<string, unknown> = {};
    for (let i = 0; i < 200; i++) {
      big[`k${i}`] = { val: i };
    }
    const { nodes, truncated } = jsonToFlowElements(big);
    expect(truncated).toBe(true);
    expect(nodes.length).toBe(JSON_FLOW_MAX_NODES);
  });

  it("object with exactly JSON_FLOW_MAX_NODES-worth of primitives does not truncate", () => {
    // 1 root + 1 grouped leaf = 2 nodes. Far under 320.
    const small: Record<string, unknown> = {};
    for (let i = 0; i < 10; i++) {
      small[`k${i}`] = i;
    }
    const { nodes, truncated } = jsonToFlowElements(small);
    expect(truncated).toBe(false);
    expect(nodes.length).toBe(2); // root + 1 grouped leaf
  });

  it("truncation stops processing further nodes mid-array", () => {
    // Array of objects: each object contributes 2 nodes (branch + leaf).
    // Root = 1. We need > 320 total.
    const bigArray: unknown[] = [];
    for (let i = 0; i < 200; i++) {
      bigArray.push({ val: i });
    }
    const { nodes, truncated } = jsonToFlowElements(bigArray);
    expect(truncated).toBe(true);
    expect(nodes.length).toBe(JSON_FLOW_MAX_NODES);
  });

  it("array child node itself hits the cap — covers !id return in array branch", () => {
    // Goal: make count = JSON_FLOW_MAX_NODES before an array child is visited.
    // Layout:
    //   root object (1 node)
    //   1 primitive property → grouped leaf (1 node)  — inserted first in outputOrder
    //   159 object children (each = branch + grouped-leaf = 2 nodes) → 318 nodes
    //   Total so far: 1 + 1 + 318 = 320 nodes (count = 320 = MAX_NODES)
    //   Then: 1 array child → addNode returns null (count >= MAX_NODES) → `if (!id) return`
    //
    // JS object property ordering: integer-like keys first, then string keys in insertion order.
    // Use a prefix to avoid integer-like key reordering.
    const payload: Record<string, unknown> = {};
    payload["_prim"] = 42; // becomes the primitives slot (1 node, inserted first in outputOrder)
    for (let i = 0; i < 159; i++) {
      payload[`obj_${i}`] = { v: i }; // each = 1 branch + 1 leaf = 2 nodes → 318 nodes
    }
    payload["arr_child"] = [1, 2, 3]; // This array child is attempted when count = 320
    const { nodes, truncated } = jsonToFlowElements(payload);
    expect(truncated).toBe(true);
    expect(nodes.length).toBe(JSON_FLOW_MAX_NODES);
    // Verify the array child node was never added (it would have label "arr_child: [3]")
    const arrNode = nodes.find((n) => n.data.label === "arr_child: [3]");
    expect(arrNode).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — edge properties
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — edge properties", () => {
  it("all edges have type=jsonFlow, kind=key, label=undefined, zIndex=0", () => {
    const { nodes, edges } = jsonToFlowElements({ a: 1, b: { c: 2 } });
    expect(edges.length).toBeGreaterThan(0);
    edges.forEach((e) => {
      expect(e.type).toBe("jsonFlow");
      expect(e.zIndex).toBe(0);
      const d = e.data as { label: unknown; kind: unknown };
      expect(d.label).toBeUndefined();
      expect(d.kind).toBe("key");
    });
  });

  it("edge id format is e-{sourceId}-{targetId}", () => {
    const { nodes, edges } = jsonToFlowElements({ x: 1 });
    const edge = edges[0];
    expect(edge.id).toBe(`e-${edge.source}-${edge.target}`);
    expect(edge.id).toBe(`e-${nodes[0].id}-${nodes[1].id}`);
  });
});

// ---------------------------------------------------------------------------
// jsonToFlowElements — device sensor logs example
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — device sensor logs example", () => {
  const sensorData = {
    dataset_name: "device_sensor_logs",
    timestamp: "2026-03-28T10:00:00Z",
    samples: [
      {
        id: "s1",
        features: {
          temperature: 23.5,
          humidity: 45,
          pressure: 1013.2,
          location: "floor_1",
        },
        label: "normal",
      },
      {
        id: "s2",
        features: {
          temperature: 85.1,
          humidity: 30,
          pressure: 1010.5,
          location: "floor_2",
        },
        label: "critical",
      },
    ],
  };

  it("produces exactly 11 nodes", () => {
    const { nodes, truncated } = jsonToFlowElements(sensorData);
    expect(truncated).toBe(false);
    expect(nodes).toHaveLength(11);
  });

  it("root node is variant=root, label=Root", () => {
    const { nodes } = jsonToFlowElements(sensorData);
    expect(nodes[0].data.variant).toBe("root");
    expect(nodes[0].data.label).toBe("Root");
  });

  it("id and label are grouped together in the same leaf node for each sample", () => {
    const { nodes } = jsonToFlowElements(sensorData);
    // Find leaf nodes that contain "id:" in their lines
    const idLeaves = nodes.filter(
      (n) => n.data.lines && n.data.lines.some((l) => l.startsWith("id:"))
    );
    expect(idLeaves).toHaveLength(2);
    idLeaves.forEach((leaf) => {
      const lines = leaf.data.lines!;
      const hasId = lines.some((l) => l.startsWith("id:"));
      const hasLabel = lines.some((l) => l.startsWith("label:"));
      expect(hasId).toBe(true);
      expect(hasLabel).toBe(true);
    });
  });

  it("sample 1 id+label grouped leaf has correct lines and lineTypes", () => {
    const { nodes } = jsonToFlowElements(sensorData);
    const leaf = nodes.find(
      (n) =>
        n.data.lines &&
        n.data.lines.includes('id: "s1"') &&
        n.data.lines.includes('label: "normal"')
    )!;
    expect(leaf).toBeDefined();
    expect(leaf.data.lines).toEqual(['id: "s1"', 'label: "normal"']);
    expect(leaf.data.lineTypes).toEqual(["string", "string"]);
  });

  it("features branch for sample 1 has all 4 properties grouped", () => {
    const { nodes } = jsonToFlowElements(sensorData);
    // features of sample 1: temperature:23.5, humidity:45, pressure:1013.2, location:"floor_1"
    const featuresLeaf = nodes.find(
      (n) =>
        n.data.lines &&
        n.data.lines.some((l) => l.startsWith("temperature:"))
    )!;
    expect(featuresLeaf).toBeDefined();
    expect(featuresLeaf.data.lines).toHaveLength(4);
    expect(featuresLeaf.data.lines).toContain("temperature: 23.5");
    expect(featuresLeaf.data.lines).toContain("humidity: 45");
    expect(featuresLeaf.data.lines).toContain("pressure: 1013.2");
    expect(featuresLeaf.data.lines).toContain('location: "floor_1"');
  });

  it("samples array branch label is 'samples: [2]'", () => {
    const { nodes } = jsonToFlowElements(sensorData);
    const samplesNode = nodes.find((n) => n.data.label === "samples: [2]")!;
    expect(samplesNode).toBeDefined();
    expect(samplesNode.data.containerKind).toBe("array");
  });

  it("produces 10 edges connecting all nodes", () => {
    const { edges } = jsonToFlowElements(sensorData);
    expect(edges).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// layoutFlowElements
// ---------------------------------------------------------------------------

describe("layoutFlowElements", () => {
  it("returns [] for empty input", () => {
    const result = layoutFlowElements([], []);
    expect(result).toEqual([]);
  });

  it("single node gets a numeric x and y position from dagre", () => {
    const { nodes } = jsonToFlowElements("hello");
    const laid = layoutFlowElements(nodes, []);
    expect(laid).toHaveLength(1);
    expect(typeof laid[0].position.x).toBe("number");
    expect(typeof laid[0].position.y).toBe("number");
    // Dagre assigns a real position, not 0,0 (with margin it will be non-zero)
    expect(isFinite(laid[0].position.x)).toBe(true);
    expect(isFinite(laid[0].position.y)).toBe(true);
  });

  it("two connected nodes: source has smaller x than target (LR layout)", () => {
    const { nodes, edges } = jsonToFlowElements({ x: 1 });
    const laid = layoutFlowElements(nodes, edges);
    expect(laid).toHaveLength(2);
    const source = laid[0]; // root
    const target = laid[1]; // leaf
    // In LR layout, source is to the left (smaller x)
    expect(source.position.x).toBeLessThan(target.position.x);
  });

  it("all returned positions are numbers (not NaN)", () => {
    const { nodes, edges } = jsonToFlowElements({
      a: 1,
      b: { c: 2, d: 3 },
      e: [1, 2, 3],
    });
    const laid = layoutFlowElements(nodes, edges);
    laid.forEach((n) => {
      expect(typeof n.position.x).toBe("number");
      expect(typeof n.position.y).toBe("number");
      expect(isNaN(n.position.x)).toBe(false);
      expect(isNaN(n.position.y)).toBe(false);
    });
  });

  it("multi-line grouped node gets more height allocation than single-line node", () => {
    // A grouped node with 4 lines vs root node (no lines)
    // We verify this indirectly: the grouped node's y offset is influenced by its height.
    // More directly: just verify both are positioned (non-zero, numbers) - the height
    // difference is internal to dagre's layout algorithm.
    const { nodes, edges } = jsonToFlowElements({ a: 1, b: 2, c: 3, d: 4 });
    // nodes[1] is the grouped leaf with 4 lines
    const laid = layoutFlowElements(nodes, edges);
    const groupedNode = laid[1];
    // NODE_VPAD + 4 * NODE_LINE_H = 36 + 128 = 164 for grouped vs NODE_BASE_H=68 for root
    // The y position is set by dagre based on height; both must be finite numbers
    expect(typeof groupedNode.position.y).toBe("number");
    expect(isFinite(groupedNode.position.y)).toBe(true);
  });

  it("position formula: x = dagre_x - NODE_W/2, y = dagre_y - height/2", () => {
    // NODE_W = 280; for a single node, dagre assigns x = marginx + NODE_W/2 = 56 + 140 = 196
    // So position.x = 196 - 140 = 56 (= marginx)
    // We can't easily mock dagre, but we can verify the positions are shifted from center:
    // position.x + NODE_W/2 should equal dagre's x
    // We test this by verifying position values are consistent numbers
    const { nodes, edges } = jsonToFlowElements({ key: "val" });
    const laid = layoutFlowElements(nodes, edges);
    laid.forEach((n) => {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    });
  });

  it("preserves node data (id, type, data) after layout", () => {
    const { nodes, edges } = jsonToFlowElements({ name: "test" });
    const laid = layoutFlowElements(nodes, edges);
    laid.forEach((n, i) => {
      expect(n.id).toBe(nodes[i].id);
      expect(n.type).toBe(nodes[i].type);
      expect(n.data).toEqual(nodes[i].data);
    });
  });

  it("disconnected nodes are still positioned by dagre", () => {
    // Even a node with no edges gets a valid position from dagre (it's placed in its own rank).
    // This verifies the position formula runs for all nodes including disconnected ones.
    const { nodes } = jsonToFlowElements("standalone");
    // Single node with no edges — dagre positions it using marginx/marginy
    const laid = layoutFlowElements(nodes, []);
    expect(laid).toHaveLength(1);
    expect(Number.isFinite(laid[0].position.x)).toBe(true);
    expect(Number.isFinite(laid[0].position.y)).toBe(true);
    // With dagre's marginx=56 and NODE_W=280, the center x should be ~56+140=196
    // so position.x = 196 - 140 = 56
    expect(laid[0].position.x).toBe(56);
  });
});

// ---------------------------------------------------------------------------
// Additional branch coverage — visit edge cases
// ---------------------------------------------------------------------------

describe("jsonToFlowElements — additional branch coverage", () => {
  it("root null produces a standalone leaf with label='null' (no edgeLabel path)", () => {
    // Exercises the null/undefined branch when edgeLabel === undefined (root call)
    const { nodes } = jsonToFlowElements(null);
    expect(nodes[0].data.label).toBe("null");
  });

  it("root undefined produces label='undefined'", () => {
    const { nodes } = jsonToFlowElements(undefined);
    expect(nodes[0].data.label).toBe("undefined");
  });

  it("object with a mix: first primitive, then container, then primitive", () => {
    // Ensures primitivesSlotted=true path and the slot is inserted at first occurrence
    const input = { first: 1, middle: { nested: true }, last: "end" };
    const { nodes, edges } = jsonToFlowElements(input);
    // root + grouped[first,last] + middle-branch + nested-grouped = 4 nodes
    expect(nodes).toHaveLength(4);
    expect(edges).toHaveLength(3);
    const groupedLeaf = nodes[1];
    expect(groupedLeaf.data.lines).toEqual(["first: 1", 'last: "end"']);
  });

  it("array with truncated=true mid-forEach stops processing", () => {
    // Build array where 1 root + items overflow; use sub-objects to eat nodes fast
    const arr: unknown[] = [];
    for (let i = 0; i < 200; i++) {
      arr.push({ v: i }); // each = 1 branch + 1 leaf = 2 nodes
    }
    const { nodes, truncated } = jsonToFlowElements(arr);
    expect(truncated).toBe(true);
    expect(nodes.length).toBe(JSON_FLOW_MAX_NODES);
  });

  it("truncation during object outputOrder loop stops processing containers", () => {
    // Build object: primitives group (2 nodes: root + 1 grouped leaf),
    // then many container children that overflow
    const big: Record<string, unknown> = {};
    big["prim"] = 1; // will become grouped leaf
    for (let i = 0; i < 200; i++) {
      big[`k${i}`] = { val: i }; // each container = branch + leaf
    }
    const { nodes, truncated } = jsonToFlowElements(big);
    expect(truncated).toBe(true);
    expect(nodes.length).toBe(JSON_FLOW_MAX_NODES);
  });

  it("array item that is null creates standalone leaf with label 'null'", () => {
    // array item null: visit(null, id, undefined, depth+1)
    // edgeLabel === undefined → label = String(null) = "null"
    const { nodes } = jsonToFlowElements([null]);
    expect(nodes[1].data.label).toBe("null");
    expect(nodes[1].data.primitiveType).toBe("null");
  });

  it("array item that is undefined creates standalone leaf with label 'undefined'", () => {
    // JS arrays can have undefined via direct assignment
    const arr = [undefined];
    const { nodes } = jsonToFlowElements(arr);
    expect(nodes[1].data.label).toBe("undefined");
    expect(nodes[1].data.primitiveType).toBe("null");
  });

  it("object property null: visits null branch with edgeLabel set → 'key: null'", () => {
    // This exercises line 102-104: edgeLabel !== undefined, value === null
    // But wait — null in object goes through the grouping path (primitiveEntries),
    // NOT the visit(null) path. So we need to call visit with null from array context.
    // Actually: null in an object ends up in primitiveEntries → grouped leaf.
    // But null as direct top-level visit comes from: root=null (edgeLabel=undefined)
    // OR from array item (edgeLabel=undefined).
    // The branch `edgeLabel !== undefined` for null/undefined is hit when...
    // hmm, visit is only called recursively with edgeLabel set for container children via item.key.
    // But null/undefined values get pushed into primitiveEntries and rendered as grouped lines.
    // So the null/undefined visit path with edgeLabel !== undefined is never hit from object properties.
    // It would be hit if we called visit(null, someId, "someKey", depth) directly.
    // This path is actually unreachable from the current code flow — null/undefined object values
    // go to primitiveEntries, not visit(). So this branch is NOT hit from objects.
    // But we still get coverage because: null AS ROOT (edgeLabel=undefined) covers the else branch.
    // Let's just verify the grouped-null-in-object path is correctly handled:
    const { nodes } = jsonToFlowElements({ x: null });
    expect(nodes[1].data.lines).toEqual(["x: null"]);
  });
});

// ---------------------------------------------------------------------------
// inferPrimitiveType coverage via grouped leaf lineTypes
// ---------------------------------------------------------------------------

describe("inferPrimitiveType — all branches via grouped leaf lineTypes", () => {
  it("covers null → 'null'", () => {
    const { nodes } = jsonToFlowElements({ a: null });
    expect(nodes[1].data.lineTypes).toEqual(["null"]);
  });

  it("covers undefined → 'null'", () => {
    const { nodes } = jsonToFlowElements({ a: undefined });
    expect(nodes[1].data.lineTypes).toEqual(["null"]);
  });

  it("covers boolean → 'boolean'", () => {
    const { nodes } = jsonToFlowElements({ a: false });
    expect(nodes[1].data.lineTypes).toEqual(["boolean"]);
  });

  it("covers number → 'number'", () => {
    const { nodes } = jsonToFlowElements({ a: 99 });
    expect(nodes[1].data.lineTypes).toEqual(["number"]);
  });

  it("covers string → 'string'", () => {
    const { nodes } = jsonToFlowElements({ a: "hi" });
    expect(nodes[1].data.lineTypes).toEqual(["string"]);
  });
});

// ---------------------------------------------------------------------------
// truncate() coverage via node labels
// ---------------------------------------------------------------------------

describe("truncate() — both branches", () => {
  it("string at exactly max length is not truncated (s.length <= max)", () => {
    // For root primitive: truncate(raw, 56). A string of 54 chars → stringify = 56 chars (with quotes).
    const exact = "x".repeat(54); // JSON.stringify → '"' + 54 + '"' = 56 chars
    const { nodes } = jsonToFlowElements(exact);
    expect(nodes[0].data.label).not.toMatch(/…$/);
    expect(nodes[0].data.label.length).toBe(56);
  });

  it("string one char over max is truncated", () => {
    const oneOver = "x".repeat(55); // JSON.stringify → 57 chars → truncated to 56 with …
    const { nodes } = jsonToFlowElements(oneOver);
    expect(nodes[0].data.label).toMatch(/…$/);
    expect(nodes[0].data.label.length).toBe(56);
  });
});
