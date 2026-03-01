"use client";

import { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Braces,
  Brackets,
  Type as TypeIcon,
  Hash,
  List,
  ToggleLeft,
  Trash2,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JsonType = "object" | "array" | "string" | "number" | "boolean" | "null";

const TYPE_OPTIONS: { value: JsonType; label: string; icon: React.ReactNode }[] = [
  { value: "object", label: "Object", icon: <Braces className="w-3.5 h-3.5" /> },
  { value: "array", label: "Array", icon: <Brackets className="w-3.5 h-3.5" /> },
  { value: "string", label: "String", icon: <TypeIcon className="w-3.5 h-3.5" /> },
  { value: "number", label: "Number", icon: <Hash className="w-3.5 h-3.5" /> },
  { value: "boolean", label: "Boolean", icon: <ToggleLeft className="w-3.5 h-3.5" /> },
  { value: "null", label: "Null", icon: <span className="text-[10px] font-mono">∅</span> },
];

function getType(v: unknown): JsonType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "object") return "object";
  if (typeof v === "string") return "string";
  if (typeof v === "number") return "number";
  if (typeof v === "boolean") return "boolean";
  return "null";
}

function getTypeIcon(v: unknown) {
  const t = getType(v);
  return TYPE_OPTIONS.find((o) => o.value === t)?.icon ?? <TypeIcon className="w-3.5 h-3.5" />;
}

function setAtPath(data: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const current = data as Record<string, unknown> | unknown[];
  const isArray = Array.isArray(current);
  const key = isArray ? parseInt(head, 10) : head;
  const next = isArray ? [...(current as unknown[])] : { ...(current as Record<string, unknown>) };
  if (rest.length === 0) {
    if (isArray) (next as unknown[])[key] = value;
    else (next as Record<string, unknown>)[key] = value;
    return next;
  }
  const child = isArray ? (current as unknown[])[key] : (current as Record<string, unknown>)[key];
  const updated = setAtPath(child, rest, value);
  if (isArray) (next as unknown[])[key] = updated;
  else (next as Record<string, unknown>)[key] = updated;
  return next;
}

function deleteAtPath(data: unknown, path: string[]): unknown {
  if (path.length <= 1) {
    const [key] = path;
    const current = data as Record<string, unknown> | unknown[];
    if (Array.isArray(current)) {
      const arr = current.filter((_, i) => String(i) !== key);
      return arr;
    }
    const obj = { ...(data as Record<string, unknown>) };
    delete obj[key];
    return obj;
  }
  const [head, ...rest] = path;
  const current = data as Record<string, unknown> | unknown[];
  const isArray = Array.isArray(current);
  const key = isArray ? parseInt(head, 10) : head;
  const next = isArray ? [...(current as unknown[])] : { ...(current as Record<string, unknown>) };
  const child = isArray ? (current as unknown[])[key] : (current as Record<string, unknown>)[key];
  const updated = deleteAtPath(child, rest);
  if (isArray) (next as unknown[])[key] = updated;
  else (next as Record<string, unknown>)[key] = updated;
  return next;
}

function defaultValue(type: JsonType): unknown {
  switch (type) {
    case "object": return {};
    case "array": return [];
    case "string": return "";
    case "number": return 0;
    case "boolean": return false;
    case "null": return null;
    default: return null;
  }
}

interface JsonVisualEditorProps {
  parsed: unknown;
  onChange: (json: string) => void;
  dark?: boolean;
}

function EditableNode({
  keyName,
  value,
  path,
  depth,
  onUpdate,
  onDelete,
  isRoot,
}: {
  keyName?: string;
  value: unknown;
  path: string[];
  depth: number;
  onUpdate: (path: string[], value: unknown) => void;
  onDelete: (path: string[]) => void;
  isRoot?: boolean;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<JsonType>("string");
  const [newVal, setNewVal] = useState("");
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(String(value));

  const isExpandable = value !== null && typeof value === "object";

  const handleAdd = useCallback(() => {
    if (Array.isArray(value)) {
      const arr = value as unknown[];
      const v = defaultValue(newType);
      if (newType === "number") {
        const n = parseFloat(newVal);
        onUpdate([...path, String(arr.length)], isNaN(n) ? 0 : n);
      } else if (newType === "boolean") {
        onUpdate([...path, String(arr.length)], newVal.toLowerCase() === "true");
      } else if (newType === "string") {
        onUpdate([...path, String(arr.length)], newVal);
      } else {
        onUpdate([...path, String(arr.length)], v);
      }
    } else if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      const k = newKey.trim() || `key_${Object.keys(obj).length}`;
      let v: unknown = defaultValue(newType);
      if (newType === "number") v = parseFloat(newVal) || 0;
      else if (newType === "boolean") v = newVal.toLowerCase() === "true";
      else if (newType === "string") v = newVal;
      onUpdate([...path, k], v);
    }
    setAdding(false);
    setNewKey("");
    setNewType("string");
    setNewVal("");
    if (!expanded) setExpanded(true);
  }, [value, path, newKey, newType, newVal, onUpdate, expanded]);

  const handleValueChange = useCallback(
    (raw: string) => {
      if (value === null || typeof value === "object") return;
      const t = getType(value);
      if (t === "number") {
        const n = parseFloat(raw);
        onUpdate(path, isNaN(n) ? 0 : n);
      } else if (t === "boolean") {
        onUpdate(path, raw.toLowerCase() === "true");
      } else {
        onUpdate(path, raw);
      }
      setEditing(false);
    },
    [value, path, onUpdate]
  );

  const indent = depth * 20;

  if (!isRoot && !isExpandable) {
    return (
      <div
        className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-secondary/40 group"
        style={{ marginLeft: indent }}
      >
        {keyName !== undefined && (
          <span className="text-json-key text-xs font-mono shrink-0">
            "{keyName}":{" "}
          </span>
        )}
        <span className="text-muted-foreground shrink-0">{getTypeIcon(value)}</span>
        {editing ? (
          <Input
            autoFocus
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={() => handleValueChange(editVal)}
            onKeyDown={(e) => e.key === "Enter" && handleValueChange(editVal)}
            className="h-7 text-xs font-mono flex-1 max-w-[200px]"
          />
        ) : (
          <button
            onClick={() => {
              setEditVal(String(value));
              setEditing(true);
            }}
            className="text-left text-xs font-mono truncate flex-1 min-w-0 text-json-string"
          >
            {typeof value === "string" ? `"${value}"` : String(value)}
          </button>
        )}
        <button
          onClick={() => onDelete(path)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive transition-opacity"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries((value as Record<string, unknown>) ?? {});

  return (
    <div className="py-0.5" style={{ marginLeft: indent }}>
      <div className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-secondary/40 group">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {keyName !== undefined && (
          <span className="text-json-key text-xs font-mono shrink-0">
            "{keyName}":{" "}
          </span>
        )}
        <span className="text-muted-foreground shrink-0">
          {Array.isArray(value) ? (
            <Brackets className="w-3.5 h-3.5" />
          ) : (
            <Braces className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
          {entries.length} {Array.isArray(value) ? "items" : "keys"}
        </span>
        {!isRoot && (
          <button
            onClick={() => onDelete(path)}
            className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive transition-opacity"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-l border-border/60 ml-3 pl-2">
          {entries.map(([k, v]) => (
            <EditableNode
              key={path.join(".") + k}
              keyName={Array.isArray(value) ? `[${k}]` : k}
              value={v}
              path={[...path, k]}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}

          {adding && (
            <div className="flex flex-wrap items-center gap-2 py-2 px-2 bg-secondary/30 rounded-lg my-2">
              {!Array.isArray(value) && (
                <Input
                  placeholder="Property name"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="h-8 text-xs w-28"
                />
              )}
              <Select value={newType} onValueChange={(v) => setNewType(v as JsonType)}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex items-center gap-2">
                        {o.icon} {o.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(newType === "string" || newType === "number" || newType === "boolean") && (
                <Input
                  placeholder={
                    newType === "number"
                      ? "0"
                      : newType === "boolean"
                      ? "true/false"
                      : "Value"
                  }
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="h-8 text-xs w-32"
                />
              )}
              <Button size="sm" className="h-8" onClick={handleAdd}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={() => {
                  setAdding(false);
                  setNewKey("");
                  setNewType("string");
                  setNewVal("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD {Array.isArray(value) ? "item" : "property"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function JsonVisualEditor({ parsed, onChange, dark }: JsonVisualEditorProps) {
  const handleUpdate = useCallback(
    (path: string[], value: unknown) => {
      const updated = setAtPath(parsed, path, value);
      onChange(JSON.stringify(updated, null, 2));
    },
    [parsed, onChange]
  );

  const handleDelete = useCallback(
    (path: string[]) => {
      const updated = deleteAtPath(parsed, path);
      onChange(JSON.stringify(updated, null, 2));
    },
    [parsed, onChange]
  );

  if (parsed === null || parsed === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
          <Braces className="w-7 h-7 opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No JSON to edit</p>
          <p className="text-xs mt-1">
            Paste valid JSON in the editor on the left, then edit it visually here.
          </p>
        </div>
      </div>
    );
  }

  if (typeof parsed !== "object") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
        <p className="text-sm">Root must be an object or array to edit visually.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-4 pb-3 border-b border-border">
        <p className="text-xs text-muted-foreground">
          Edit JSON visually — no coding required. Add, remove, and change values using the form
          below. Changes sync with the code editor.
        </p>
      </div>
      <EditableNode
        value={parsed}
        path={[]}
        depth={0}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isRoot
      />
    </div>
  );
}
