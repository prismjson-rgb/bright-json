"use client";
import dynamic from "next/dynamic";

const JsonNoteEditorInner = dynamic(() => import("./JsonNoteEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Loading note editor…
    </div>
  ),
});

export default function JsonNoteEditor() {
  return <JsonNoteEditorInner />;
}
