"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Minus,
  Copy,
  Download,
  Eye,
  Edit3,
  Check,
} from "lucide-react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";

function ToolBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function JsonNoteEditorInner() {
  const [previewMode, setPreviewMode] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [copied, setCopied] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder:
          "Add notes, annotations, and documentation about this JSON…\n\nTip: You can format text, add code blocks, headings, and lists.",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "outline-none min-h-full",
      },
    },
  });

  const handleCopy = () => {
    if (!editor) return;
    const text = editor.getText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!editor) return;
    const text = editor.getText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!editor) return;
    if (!previewMode) {
      setPreviewText(editor.getText());
    }
    setPreviewMode((p) => !p);
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border bg-surface shrink-0 flex-wrap">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code className="w-3.5 h-3.5" />
        </ToolBtn>

        <div className="h-4 w-px bg-border mx-1" />

        <InfoHelp text={MODES.notes.help} label="About Notes" side="bottom" className="shrink-0" />

        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <span className="font-mono text-[10px] font-bold">{"</>"}</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <div className="flex-1" />

        <ToolBtn onClick={handlePreview} active={previewMode} title="Markdown preview">
          {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </ToolBtn>
        <ToolBtn onClick={handleCopy} title="Copy as plain text">
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
        </ToolBtn>
        <ToolBtn onClick={handleDownload} title="Download as .txt">
          <Download className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Editor content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {previewMode ? (
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 h-full">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {previewText}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="tiptap-editor h-full">
            <EditorContent editor={editor} className="h-full" />
          </div>
        )}
      </div>
    </div>
  );
}
