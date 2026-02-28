"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { useJsonConvert, type ConvertFormat } from "@/hooks/useJsonConvert";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
      Loading…
    </div>
  ),
});

const TABS: { id: ConvertFormat; label: string; lang: string }[] = [
  { id: "yaml", label: "YAML", lang: "yaml" },
  { id: "xml", label: "XML", lang: "xml" },
  { id: "csv", label: "CSV", lang: "plaintext" },
];

interface JsonConvertPanelProps {
  parsed: unknown;
  dark: boolean;
}

export default function JsonConvertPanel({ parsed, dark }: JsonConvertPanelProps) {
  const { format, setFormat, output, fileExtension, mimeType } = useJsonConvert(parsed);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFormat(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                format === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="toolbar-btn text-muted-foreground"
          title="Copy output"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="hidden md:inline">{copied ? "Copied!" : "Copy"}</span>
        </button>
        <button
          onClick={handleDownload}
          className="toolbar-btn text-muted-foreground"
          title={`Download .${fileExtension}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Download .{fileExtension}</span>
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 min-h-0">
        {!parsed ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Paste valid JSON in the editor to convert
          </div>
        ) : (
          <MonacoEditor
            height="100%"
            language={TABS.find((t) => t.id === format)?.lang ?? "plaintext"}
            theme={dark ? "vs-dark" : "vs"}
            value={output}
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              padding: { top: 12 },
            }}
          />
        )}
      </div>
    </div>
  );
}
