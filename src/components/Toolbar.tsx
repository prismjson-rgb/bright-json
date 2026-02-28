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
  Sparkles,
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
    <header className="flex items-center gap-0.5 px-4 py-2.5 bg-toolbar border-b border-border sticky top-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Braces className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-foreground leading-none">
            JSON Viewer
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">Format · Validate · Explore</span>
        </div>
      </div>

      <Divider />

      {/* Format group */}
      <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5">
        <ToolBtn onClick={onFormat} icon={<Sparkles className="w-3.5 h-3.5" />} label="Beautify" shortcut="⌘⇧F" disabled={!hasJson} accent />
        <ToolBtn onClick={onMinify} icon={<Minimize2 className="w-3.5 h-3.5" />} label="Minify" shortcut="⌘M" disabled={!hasJson} />
        <ToolBtn onClick={onSortKeys} icon={<ArrowUpDown className="w-3.5 h-3.5" />} label="Sort" disabled={!hasJson} />
      </div>

      <Divider />

      {/* Actions group */}
      <div className="flex items-center gap-0.5">
        <ToolBtn
          onClick={handleCopy}
          icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          label={copied ? "Copied!" : "Copy"}
          disabled={!hasJson}
          accent={copied}
        />
        <ToolBtn onClick={onDownload} icon={<Download className="w-3.5 h-3.5" />} label="Export" disabled={!hasJson} />
        <ToolBtn onClick={() => fileRef.current?.click()} icon={<Upload className="w-3.5 h-3.5" />} label="Import" />
        <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />
      </div>

      <Divider />

      {/* Tree controls */}
      <div className="flex items-center gap-0.5">
        <ToolBtn onClick={onExpandAll} icon={<ChevronsUpDown className="w-3.5 h-3.5" />} label="Expand" disabled={!hasJson} />
        <ToolBtn onClick={onCollapseAll} icon={<ChevronsDownUp className="w-3.5 h-3.5" />} label="Collapse" disabled={!hasJson} />
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150"
        title="Toggle theme (⌘L)"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-border mx-2 shrink-0" />;
}

function ToolBtn({
  onClick,
  icon,
  label,
  shortcut,
  disabled,
  accent,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-btn ${
        accent
          ? "text-primary"
          : "text-muted-foreground"
      }`}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
