"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import type { ToolFaq } from "@/lib/tool-faqs";

export function FaqAccordion({ faqs }: { faqs: ToolFaq[] }) {
  const allValues = faqs.map((_, i) => `item-${i}`);

  return (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={allValues}
      className="space-y-3"
    >
      {faqs.map((faq, i) => (
        <AccordionPrimitive.Item
          key={faq.question}
          value={`item-${i}`}
          className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 overflow-hidden"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between gap-4 py-4 text-left text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 rounded">
              {faq.question}
              <span className="shrink-0 text-cyan-300 transition-transform duration-200">
                <Plus className="h-4 w-4 group-data-[state=open]:hidden" />
                <Minus className="h-4 w-4 hidden group-data-[state=open]:block" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="pb-4 leading-6 text-slate-300">{faq.answer}</p>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
