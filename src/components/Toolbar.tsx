import {
  Braces,
  Copy,
  Download,
  Upload,
  Minimize2,
  ArrowUpDown,
  Sun,
  Moon,
  ChevronsDownUp,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useRef, useState } from "react";

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onSortKeys: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onUpload: (content: string) => void;
  onToggleTheme: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  dark: boolean;
  hasJson: boolean;
}

export default function Toolbar({
  onFormat,
  onMinify,
  onSortKeys,
  onCopy,
  onDownload,
  onUpload,
  onToggleTheme,
  onExpandAll,
  onCollapseAll,
  dark,
  hasJson,
}: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onUpload(reader.result);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-toolbar border-b border-border sticky top-0 z-10 flex-wrap">
      <div className="flex items-center gap-1 mr-2">
        <Braces className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm tracking-tight text-foreground">JSON Viewer</span>
      </div>

      <div className="h-5 w-px bg-border mx-1" />

      <ToolBtn onClick={onFormat} icon={<Braces className="w-3.5 h-3.5" />} label="Format" shortcut="⌘⇧F" disabled={!hasJson} />
      <ToolBtn onClick={onMinify} icon={<Minimize2 className="w-3.5 h-3.5" />} label="Minify" shortcut="⌘M" disabled={!hasJson} />
      <ToolBtn onClick={onSortKeys} icon={<ArrowUpDown className="w-3.5 h-3.5" />} label="Sort Keys" disabled={!hasJson} />

      <div className="h-5 w-px bg-border mx-1" />

      <ToolBtn onClick={handleCopy} icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} label={copied ? "Copied!" : "Copy"} disabled={!hasJson} />
      <ToolBtn onClick={onDownload} icon={<Download className="w-3.5 h-3.5" />} label="Download" disabled={!hasJson} />
      <ToolBtn onClick={() => fileRef.current?.click()} icon={<Upload className="w-3.5 h-3.5" />} label="Upload" />
      <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />

      <div className="h-5 w-px bg-border mx-1" />

      <ToolBtn onClick={onExpandAll} icon={<ChevronsUpDown className="w-3.5 h-3.5" />} label="Expand" disabled={!hasJson} />
      <ToolBtn onClick={onCollapseAll} icon={<ChevronsDownUp className="w-3.5 h-3.5" />} label="Collapse" disabled={!hasJson} />

      <div className="flex-1" />

      <button
        onClick={onToggleTheme}
        className="p-1.5 rounded-md hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
        title="Toggle theme (⌘L)"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}

function ToolBtn({
  onClick,
  icon,
  label,
  shortcut,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-toolbar-foreground hover:bg-accent/20 hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
