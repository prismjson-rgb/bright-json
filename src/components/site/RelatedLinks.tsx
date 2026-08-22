import Link from "next/link";
import { ArrowRight, BookOpen, Wrench } from "lucide-react";
import { getAllTools } from "@/lib/tool-content";
import { getTutorialSections } from "@/lib/learn-content";

interface RelatedLinksProps {
  relatedTools: string[];
  relatedLearn: string[];
  /** "dark" for the tool landing page's dark-glass aside, "light" for the app-shell learn article theme. */
  variant?: "dark" | "light";
}

export function RelatedLinks({ relatedTools, relatedLearn, variant = "light" }: RelatedLinksProps) {
  if (relatedTools.length === 0 && relatedLearn.length === 0) return null;

  const tools = getAllTools();
  const sections = getTutorialSections();

  const toolLinks = relatedTools
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const learnLinks = relatedLearn
    .map((id) => sections.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const dark = variant === "dark";

  return (
    <div className={dark ? "space-y-4" : "mt-10 grid gap-4 sm:grid-cols-2"}>
      {toolLinks.length > 0 && (
        <div
          className={
            dark
              ? "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
              : "rounded-2xl border border-border bg-surface p-5"
          }
        >
          <div className={`mb-3 flex items-center gap-2 ${dark ? "text-slate-400" : "text-muted-foreground"}`}>
            <Wrench className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Related tools</p>
          </div>
          <ul className="space-y-2">
            {toolLinks.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}/`}
                  className={
                    dark
                      ? "group flex items-center justify-between gap-2 text-sm text-slate-300 hover:text-cyan-200"
                      : "group flex items-center justify-between gap-2 text-sm text-foreground hover:text-primary"
                  }
                >
                  {tool.title}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {learnLinks.length > 0 && (
        <div
          className={
            dark
              ? "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
              : "rounded-2xl border border-border bg-surface p-5"
          }
        >
          <div className={`mb-3 flex items-center gap-2 ${dark ? "text-slate-400" : "text-muted-foreground"}`}>
            <BookOpen className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Related lessons</p>
          </div>
          <ul className="space-y-2">
            {learnLinks.map((section) => (
              <li key={section.id}>
                <Link
                  href={`/learn/${section.id}/`}
                  className={
                    dark
                      ? "group flex items-center justify-between gap-2 text-sm text-slate-300 hover:text-cyan-200"
                      : "group flex items-center justify-between gap-2 text-sm text-foreground hover:text-primary"
                  }
                >
                  {section.title}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
