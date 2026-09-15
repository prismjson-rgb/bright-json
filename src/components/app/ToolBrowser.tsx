"use client";
import { useState } from "react";
import { Heart, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InfoHelp } from "./InfoHelp";
import { TOOL_GROUPS, workspaceTool } from "@/lib/workspace-tools";
import type { ToolSlug } from "@/lib/tool-links";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favourites: ToolSlug[];
  onToggleFavourite: (slug: ToolSlug) => void;
  onSelect: (slug: ToolSlug) => void;
}

export default function ToolBrowser({ open, onOpenChange, favourites, onToggleFavourite, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const groups = TOOL_GROUPS.map(group => ({ ...group, tools: group.slugs.map(workspaceTool).filter(tool => `${tool.label} ${tool.description} ${group.label}`.toLowerCase().includes(query.trim().toLowerCase())) })).filter(group => group.tools.length);
  const total = TOOL_GROUPS.reduce((count, group) => count + group.slugs.length, 0);
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="workspace-tool-browser flex flex-col gap-0 p-0 max-w-[420px] w-[calc(100vw-32px)] max-h-[calc(100dvh-96px)] rounded-sm" onOpenAutoFocus={() => setQuery("")} onEscapeKeyDown={event => event.stopPropagation()}>
      <DialogTitle className="sr-only">All tools</DialogTitle>
      <DialogDescription className="sr-only">Search tools and pin favourites for quick access in the sidebar.</DialogDescription>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 pr-12">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input aria-label="Search tools" placeholder={`Search ${total} tools`} value={query} onChange={event => setQuery(event.target.value)} className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="min-h-0 overflow-y-auto flex-1 pb-3">
        {groups.map(group => <section key={group.label} aria-label={group.label}>
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{group.label}</h2>
            {group.help && <InfoHelp text={group.help} label={`About ${group.label}`} />}
            <div className="h-px bg-border flex-1" /><span className="text-[10px] text-muted-foreground">{group.tools.length}</span>
          </div>
          {group.tools.map(tool => { const Icon = tool.icon; const pinned = favourites.includes(tool.slug); return <div key={tool.slug} className="flex items-center gap-1 px-2 hover:bg-secondary/70">
            <button type="button" onClick={() => onSelect(tool.slug)} title={tool.help} className="flex items-start gap-3 flex-1 min-w-0 text-left px-2 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              <Icon className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <span><span className="block text-[13px] font-medium">{tool.label}</span><span className="block text-xs leading-relaxed text-muted-foreground mt-0.5">{tool.description}</span></span>
            </button>
            <InfoHelp text={tool.help} label={`About ${tool.label}`} />
            <button type="button" aria-label={`${pinned ? "Remove" : "Add"} ${tool.label} ${pinned ? "from" : "to"} favourites`} aria-pressed={pinned} onClick={() => onToggleFavourite(tool.slug)} className="p-2 rounded-sm text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Heart className={`w-3.5 h-3.5 ${pinned ? "fill-primary text-primary" : ""}`} /></button>
          </div>; })}
        </section>)}
        {!groups.length && <p className="p-6 text-sm text-muted-foreground" role="status">No tools match. Try “convert”, “validate” or “token”.</p>}
      </div>
      <div className="flex justify-between px-4 py-3 border-t border-border text-[10px] font-mono text-muted-foreground"><span>Tab to navigate · Enter to open</span><span>{favourites.length} pinned</span></div>
    </DialogContent>
  </Dialog>;
}
