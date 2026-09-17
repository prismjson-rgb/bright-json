import { HOME_CONTENT, TOOLS_INDEX_CONTENT, LEARN_INDEX_CONTENT } from "../src/lib/site-content.generated";
import { TOOLS } from "../src/lib/tool-content.generated";
import { PAGES } from "../src/lib/pages-content.generated";
import { LEARN_SECTIONS } from "../src/lib/learn-sections.generated";

type Page = { title: string; contentMarkdown: string; metaDescription?: string; heroDescription?: string; summary?: string; faqs?: Array<{ question: string; answer: string }> };
function render(page: Page): string {
  return [`# ${page.title}`, page.metaDescription || page.heroDescription || page.summary,
    page.contentMarkdown, ...(page.faqs || []).map(faq => `## ${faq.question}\n\n${faq.answer}`)]
    .filter(Boolean).join("\n\n") + "\n";
}

// Public editorial content only: never include user documents or URL fragments.
export const markdownPages = new Map<string, string>([
  ["/", render(HOME_CONTENT)],
  ["/tools/", render(TOOLS_INDEX_CONTENT) + "\n" + TOOLS.map(p => `- [${p.title}](/tools/${p.slug}/)`).join("\n")],
  ["/learn/", render(LEARN_INDEX_CONTENT) + "\n" + LEARN_SECTIONS.map(p => `- [${p.title}](/learn/${p.id}/)`).join("\n")],
  ["/learn/errors/", "# JSON Error Fixes\n\nFind a focused lesson for a JSON parser error. Diagnose pasted JSON locally and learn how to fix the cause.\n\n" + LEARN_SECTIONS.filter(p => /error|invalid|debug|trailing|comma/i.test(p.title)).map(p => `- [${p.title}](/learn/${p.id}/)`).join("\n")],
  ...TOOLS.map(p => [`/tools/${p.slug}/`, render(p)] as [string, string]),
  ...PAGES.map(p => [`/${p.slug}/`, render(p)] as [string, string]),
  ...LEARN_SECTIONS.map(p => [`/learn/${p.id}/`, render(p)] as [string, string]),
]);

export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const ranges = accept.toLowerCase().split(",").map(part => {
    const [type, ...parameters] = part.trim().split(";");
    const q = parameters.map(p => p.trim()).find(p => p.startsWith("q="));
    const quality = q ? Number(q.slice(2)) : 1;
    return { type: type.trim(), quality: Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0 };
  });
  const markdown = ranges.find(r => r.type === "text/markdown");
  const html = ranges.find(r => r.type === "text/html") ?? ranges.find(r => r.type === "text/*") ?? ranges.find(r => r.type === "*/*");
  return !!markdown && markdown.quality > 0 && markdown.quality >= (html?.quality ?? 0);
}
