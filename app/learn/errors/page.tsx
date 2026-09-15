import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LearnErrorHub } from "@/components/learn/LearnErrorHub";
import { getTutorialSections } from "@/lib/learn-content";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export const metadata: Metadata = {
  title: "JSON Error Fixes | JSON Prism",
  description: "Find a focused lesson for a JSON parser error. Diagnose pasted JSON locally and learn how to fix the cause.",
  alternates: { canonical: `${base}/learn/errors/` },
};

export default function LearnErrorsPage() {
  return <SiteLayout activeNav="learn" learnDesign><LearnErrorHub sections={getTutorialSections()} /></SiteLayout>;
}
