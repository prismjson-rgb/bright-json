import type { ToolContent } from "./tool-content";

export interface ToolFaq {
  question: string;
  answer: string;
}

export function getToolFaqs(tool: ToolContent): ToolFaq[] {
  if (tool.faqs && tool.faqs.length > 0) {
    return tool.faqs;
  }
  // Fallback for tools without frontmatter FAQs
  return [
    {
      question: `What does ${tool.title} do?`,
      answer: `${tool.title} helps you with ${tool.useCases[0] || "JSON processing"}. It runs in your browser with no installation required.`,
    },
    {
      question: `Does ${tool.title} store my data?`,
      answer: `No. ${tool.title} runs entirely in your browser. Your JSON is never uploaded to any server unless you explicitly use the share link feature.`,
    },
    {
      question: `When should I use ${tool.title}?`,
      answer: `Use ${tool.title} when you need ${tool.useCases[0] || "to work with JSON"} or ${tool.useCases[1] || "review and edit JSON structures"}.`,
    },
    {
      question: `Is ${tool.title} free?`,
      answer: `Yes. ${tool.title} is completely free with no account or sign-up required.`,
    },
  ];
}
