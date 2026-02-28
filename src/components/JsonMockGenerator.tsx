"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Wand2, RefreshCw, Download, ArrowRight, Plus, Trash2 } from "lucide-react";
import { generateMockJson, type MockTemplate, type DateFormat, type CustomField } from "@/lib/json-mock";
import { toast } from "sonner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const TEMPLATES: { id: MockTemplate; label: string; desc: string }[] = [
  { id: "user", label: "User", desc: "name, email, age, address, role" },
  { id: "product", label: "Product", desc: "sku, name, price, category, stock" },
  { id: "order", label: "Order", desc: "orderId, items, total, status" },
  { id: "blogpost", label: "Blog Post", desc: "title, author, tags, views" },
  { id: "custom", label: "Custom", desc: "define your own fields" },
];

const FIELD_TYPES = ["string", "number", "boolean", "email", "uuid", "date"] as const;

export default function JsonMockGenerator({ onUseJson, dark }: { onUseJson: (j: string) => void; dark: boolean }) {
  const [template, setTemplate] = useState<MockTemplate>("user");
  const [count, setCount] = useState(5);
  const [nested, setNested] = useState(true);
  const [dateFormat, setDateFormat] = useState<DateFormat>("iso");
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { name: "id", type: "uuid" }, { name: "name", type: "string" }, { name: "email", type: "email" },
  ]);
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const result = generateMockJson({ template, count, nested, dateFormat, customFields });
    setOutput(JSON.stringify(result, null, 2));
  }, [template, count, nested, dateFormat, customFields]);

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `mock-${template}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const addField = () => setCustomFields(f => [...f, { name: `field${f.length + 1}`, type: "string" }]);
  const removeField = (i: number) => setCustomFields(f => f.filter((_, idx) => idx !== i));
  const updateField = (i: number, patch: Partial<CustomField>) =>
    setCustomFields(f => f.map((field, idx) => idx === i ? { ...field, ...patch } : field));

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <Wand2 className="w-3.5 h-3.5" />
        <span>Mock Generator</span>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Config panel */}
        <div className="w-64 shrink-0 border-r border-border flex flex-col overflow-y-auto p-4 gap-4">
          {/* Template */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Template</label>
            <div className="flex flex-col gap-1">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${template === t.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  <div className="font-medium">{t.label}</div>
                  <div className="opacity-60 text-[10px]">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Count: {count}</label>
            <input type="range" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1</span><span>100</span></div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={nested} onChange={e => setNested(e.target.checked)} className="accent-primary" />
              <span className="text-xs text-muted-foreground">Include nested objects</span>
            </label>
          </div>

          {/* Date format */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Date Format</label>
            <div className="flex flex-col gap-1">
              {(["iso", "unix", "human"] as DateFormat[]).map(f => (
                <button key={f} onClick={() => setDateFormat(f)}
                  className={`text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${dateFormat === f ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}>
                  {f === "iso" ? "ISO 8601 (2024-01-15T...)" : f === "unix" ? "Unix timestamp (1705...)" : "Human (January 15, 2024)"}
                </button>
              ))}
            </div>
          </div>

          {/* Custom fields */}
          {template === "custom" && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Fields</label>
              <div className="flex flex-col gap-2">
                {customFields.map((field, i) => (
                  <div key={i} className="flex gap-1 items-center">
                    <input value={field.name} onChange={e => updateField(i, { name: e.target.value })}
                      className="flex-1 bg-secondary text-foreground text-xs rounded px-2 py-1 border border-border min-w-0" placeholder="name" />
                    <select value={field.type} onChange={e => updateField(i, { type: e.target.value as CustomField["type"] })}
                      className="bg-secondary text-foreground text-xs rounded px-1 py-1 border border-border">
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => removeField(i)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={addField} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 py-1">
                  <Plus className="w-3 h-3" /> Add field
                </button>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button onClick={generate}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
            <Wand2 className="w-4 h-4" /> Generate
          </button>
        </div>

        {/* Output */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {output ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))]">
                <span className="text-[10px] text-muted-foreground flex-1">{count} {template}(s) generated</span>
                <button onClick={() => { generate(); toast.success("Regenerated!"); }} title="Regenerate"
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDownload} title="Download"
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onUseJson(output)}
                  className="flex items-center gap-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors font-medium">
                  <ArrowRight className="w-3 h-3" /> Use in Editor
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoEditor height="100%" language="json" theme={dark ? "vs-dark" : "vs"} value={output}
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
              <Wand2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">Configure options and click <strong>Generate</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
