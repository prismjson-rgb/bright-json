"use client";
import {
  Braces, Download, Upload, Minimize2, ArrowUpDown, Sun, Moon,
  Sparkles, Share2,
} from "lucide-react";
import { useRef } from "react";

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onSortKeys: () => void;
  onDownload: () => void;
  onUpload: (content: string) => void;
  onToggleTheme: () => void;
  onShare: () => void;
  dark: boolean;
  hasJson: boolean;
}

export default function Toolbar({
  onFormat, onMinify, onSortKeys, onDownload, onUpload,
  onToggleTheme, onShare,
  dark, hasJson,
}: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onUpload(reader.result); };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="flex items-center gap-0.5 px-4 py-2.5 bg-surface1 border-b border-border shadow-soft sticky top-0 z-10 flex-wrap">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Braces className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-foreground leading-none">JSON Prism</span>
          <span className="text-[10px] text-muted-foreground leading-tight">Format · Diff · Transform</span>
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

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <ToolBtn onClick={onDownload} icon={<Download className="w-3.5 h-3.5" />} label="Export" disabled={!hasJson} />
        <ToolBtn onClick={() => fileRef.current?.click()} icon={<Upload className="w-3.5 h-3.5" />} label="Import" />
        <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFileChange} className="hidden" />
      </div>

      <div className="flex-1" />

      {/* Share shortcut */}
      <ToolBtn onClick={onShare} icon={<Share2 className="w-3.5 h-3.5" />} label="Share" disabled={!hasJson} />

      <Divider />

      {/* Theme */}
      <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150" title="Toggle theme (⌘L)">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}

function Divider() { return <div className="h-6 w-px bg-border mx-2 shrink-0" />; }

function ToolBtn({ onClick, icon, label, shortcut, disabled, accent, active }: {
  onClick: () => void; icon: React.ReactNode; label: string; shortcut?: string;
  disabled?: boolean; accent?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`toolbar-btn ${active ? "bg-primary/10 text-primary" : accent ? "text-primary" : "text-muted-foreground"}`}
      title={shortcut ? `${label} (${shortcut})` : label}>
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
