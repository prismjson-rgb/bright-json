"use client";
import { BookOpen } from "lucide-react";

const TYPES = [
  { name: "Object", symbol: "{}", color: "text-[hsl(var(--json-key))]", bgColor: "bg-[hsl(var(--json-key)/0.1)]",
    desc: "An unordered collection of key-value pairs, wrapped in curly braces.",
    example: `{\n  "name": "Alice",\n  "age": 30\n}` },
  { name: "Array", symbol: "[]", color: "text-primary", bgColor: "bg-primary/10",
    desc: "An ordered list of values, wrapped in square brackets.",
    example: `["red", "green", "blue"]` },
  { name: "String", symbol: '"..."', color: "text-[hsl(var(--json-string))]", bgColor: "bg-[hsl(var(--json-string)/0.1)]",
    desc: "A sequence of characters wrapped in double quotes.",
    example: `"Hello, world!"` },
  { name: "Number", symbol: "123", color: "text-[hsl(var(--json-number))]", bgColor: "bg-[hsl(var(--json-number)/0.1)]",
    desc: "An integer or floating-point number. No quotes.",
    example: `42\n3.14\n-100` },
  { name: "Boolean", symbol: "true/false", color: "text-[hsl(var(--json-boolean))]", bgColor: "bg-[hsl(var(--json-boolean)/0.1)]",
    desc: "A logical value: either true or false. Always lowercase.",
    example: `true\nfalse` },
  { name: "Null", symbol: "null", color: "text-muted-foreground", bgColor: "bg-secondary",
    desc: "Represents the intentional absence of any value.",
    example: `null` },
];

const PATTERNS = [
  { name: "List of Objects", desc: "The most common pattern — an array of uniform objects",
    code: `[\n  { "id": 1, "name": "Alice" },\n  { "id": 2, "name": "Bob" }\n]` },
  { name: "Nested Config", desc: "Objects nested inside objects for grouping",
    code: `{\n  "server": {\n    "host": "localhost",\n    "port": 8080\n  },\n  "debug": true\n}` },
  { name: "Key-Value Lookup", desc: "Flat object used as a dictionary/map",
    code: `{\n  "USD": 1.0,\n  "EUR": 0.92,\n  "GBP": 0.79\n}` },
];

export default function JsonLearnPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="pane-header"><BookOpen className="w-3.5 h-3.5" /><span>Learn JSON</span></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Data Types</h3>
          <div className="space-y-2">
            {TYPES.map(t => (
              <div key={t.name} className="rounded-lg border border-border overflow-hidden">
                <div className={`flex items-center gap-3 px-3 py-2 ${t.bgColor}`}>
                  <span className={`font-mono font-bold text-sm ${t.color}`}>{t.symbol}</span>
                  <span className="text-xs font-semibold text-foreground">{t.name}</span>
                </div>
                <div className="px-3 py-2 bg-background">
                  <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
                  <pre className="text-[11px] font-mono text-foreground bg-secondary rounded p-2 overflow-x-auto">{t.example}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Common Patterns</h3>
          <div className="space-y-2">
            {PATTERNS.map(p => (
              <div key={p.name} className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-secondary/50">
                  <p className="text-xs font-semibold text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </div>
                <pre className="text-[11px] font-mono text-foreground bg-background p-3 overflow-x-auto">{p.code}</pre>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Rules</h3>
          <ul className="space-y-1.5">
            {[
              "Keys must always be strings in double quotes",
              "Strings must use double quotes — not single quotes",
              "No trailing commas after the last item",
              "No comments allowed (// or /* */)",
              "true, false, null are always lowercase",
              'Numbers have no quotes: 42, not "42"',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary shrink-0 font-bold">·</span>{rule}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
