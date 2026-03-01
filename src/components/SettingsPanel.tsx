"use client";

import { useState } from "react";
import { X, RotateCcw, Type, TreePine, FileJson, ChevronDown } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { FONT_FAMILIES } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  onClose: () => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-1"
      />
    </div>
  );
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [editorOpen, setEditorOpen] = useState(true);
  const [treeOpen, setTreeOpen] = useState(true);
  const [formatOpen, setFormatOpen] = useState(true);

  const handleReset = () => {
    resetSettings();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="font-semibold text-sm">Settings</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={handleReset}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Editor Settings */}
        <Collapsible open={editorOpen} onOpenChange={setEditorOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-left hover:text-foreground text-muted-foreground transition-colors">
            <Type className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm">Editor</span>
            <ChevronDown
              className={`w-4 h-4 ml-auto transition-transform ${editorOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 space-y-4 pl-6">
            <SliderRow
              label="Font size"
              value={settings.editor.fontSize}
              min={10}
              max={24}
              onChange={(v) => updateSettings({ editor: { ...settings.editor, fontSize: v } })}
            />
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Font family</Label>
              <Select
                value={settings.editor.fontFamily}
                onValueChange={(v) =>
                  updateSettings({ editor: { ...settings.editor, fontFamily: v } })
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SliderRow
              label="Indent (tab size)"
              value={settings.editor.tabSize}
              min={2}
              max={8}
              onChange={(v) => updateSettings({ editor: { ...settings.editor, tabSize: v } })}
            />
            <SliderRow
              label="Padding top"
              value={settings.editor.paddingTop}
              min={0}
              max={24}
              onChange={(v) =>
                updateSettings({ editor: { ...settings.editor, paddingTop: v } })
              }
            />
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Line numbers</Label>
              <Select
                value={settings.editor.lineNumbers}
                onValueChange={(v: "on" | "off" | "relative") =>
                  updateSettings({ editor: { ...settings.editor, lineNumbers: v } })
                }
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="relative">Relative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Word wrap</Label>
              <Switch
                checked={settings.editor.wordWrap === "on"}
                onCheckedChange={(v) =>
                  updateSettings({
                    editor: { ...settings.editor, wordWrap: v ? "on" : "off" },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Minimap</Label>
              <Switch
                checked={settings.editor.minimap}
                onCheckedChange={(v) =>
                  updateSettings({ editor: { ...settings.editor, minimap: v } })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Bracket colorization</Label>
              <Switch
                checked={settings.editor.bracketPairColorization}
                onCheckedChange={(v) =>
                  updateSettings({
                    editor: { ...settings.editor, bracketPairColorization: v },
                  })
                }
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tree View Settings */}
        <Collapsible open={treeOpen} onOpenChange={setTreeOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-left hover:text-foreground text-muted-foreground transition-colors">
            <TreePine className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm">Tree View</span>
            <ChevronDown
              className={`w-4 h-4 ml-auto transition-transform ${treeOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 space-y-4 pl-6">
            <SliderRow
              label="Indent (px)"
              value={settings.treeView.indentPx}
              min={12}
              max={36}
              onChange={(v) =>
                updateSettings({ treeView: { ...settings.treeView, indentPx: v } })
              }
            />
            <SliderRow
              label="Font size"
              value={settings.treeView.fontSize}
              min={11}
              max={18}
              onChange={(v) =>
                updateSettings({ treeView: { ...settings.treeView, fontSize: v } })
              }
            />
            <SliderRow
              label="Default expand depth"
              value={settings.treeView.defaultExpandDepth}
              min={0}
              max={10}
              onChange={(v) =>
                updateSettings({ treeView: { ...settings.treeView, defaultExpandDepth: v } })
              }
            />
            <SliderRow
              label="String truncate length"
              value={settings.treeView.stringTruncateLength}
              min={40}
              max={300}
              step={10}
              onChange={(v) =>
                updateSettings({ treeView: { ...settings.treeView, stringTruncateLength: v } })
              }
            />
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Show child count badges</Label>
              <Switch
                checked={settings.treeView.showChildCount}
                onCheckedChange={(v) =>
                  updateSettings({ treeView: { ...settings.treeView, showChildCount: v } })
                }
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Format Settings */}
        <Collapsible open={formatOpen} onOpenChange={setFormatOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-left hover:text-foreground text-muted-foreground transition-colors">
            <FileJson className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm">Formatting</span>
            <ChevronDown
              className={`w-4 h-4 ml-auto transition-transform ${formatOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 space-y-4 pl-6">
            <SliderRow
              label="Beautify indent"
              value={settings.format.beautifyIndent}
              min={2}
              max={4}
              onChange={(v) =>
                updateSettings({ format: { ...settings.format, beautifyIndent: v } })
              }
            />
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Sort keys on Beautify</Label>
              <Switch
                checked={settings.format.sortKeysOnBeautify}
                onCheckedChange={(v) =>
                  updateSettings({ format: { ...settings.format, sortKeysOnBeautify: v } })
                }
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
