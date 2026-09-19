import { SiteLayout } from "@/components/site/SiteLayout";
import { LearnErrorHub } from "@/components/learn/LearnErrorHub";
import { getTutorialSections } from "@/lib/learn-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "JSON Error Fixes | JSON Prism",
  description: "Find a focused lesson for a JSON parser error. Diagnose pasted JSON locally and learn how to fix the cause.",
  path: "/learn/errors/",
});

export default function LearnErrorsPage() {
  return <SiteLayout activeNav="learn" learnDesign><LearnErrorHub sections={getTutorialSections()} /></SiteLayout>;
}
