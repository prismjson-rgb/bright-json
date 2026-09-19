import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ToolContent } from "@/lib/tool-content";

export function ToolDirectory({ tools }: { tools: ToolContent[] }) {
  return (
    <div className="learn-lesson-list">
      {tools.map((tool, index) => (
        <Link
          key={tool.slug}
          href={`/tools/${tool.slug}/`}
          className="home-guide-tool-row"
        >
          <span className="home-guide-row-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3>{tool.title}</h3>
            <p>{tool.summary}</p>
          </div>
          <span className="home-guide-category">
            {tool.badge || tool.category || "Tool"}
          </span>
          <ArrowRight size={14} aria-hidden />
        </Link>
      ))}
    </div>
  );
}
