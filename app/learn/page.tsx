import { LEARN_LEVELS, getTutorialSections } from "@/lib/learn-content";
import { getLearnIndexContent } from "@/lib/site-content";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LearnIndex } from "@/components/learn/LearnIndex";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { breadcrumbJsonLd, buildMetadata, courseJsonLd } from "@/lib/seo";

const content = getLearnIndexContent();

const TITLE = `${content.heroTitle || content.title} | JSON Prism`;
const DESCRIPTION = content.heroDescription || "Master JSON with focused tutorials covering basics, APIs, JSON Schema, JSONPath, and more.";

export const metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/learn/",
  keywords: ["JSON tutorial", "learn JSON", "JSON for beginners", "JSON syntax", "JSON data types", "JSON Schema", "JSONPath", "REST API JSON"],
});

const courseLd = courseJsonLd({
  name: content.heroTitle || "Complete JSON Tutorial - From Beginner to Expert",
  description: DESCRIPTION,
  sections: getTutorialSections(),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Learn JSON", path: "/learn/" },
]);

export default function LearnIndexPage() {
  return (
    <SiteLayout activeNav="learn" learnDesign>
      <JsonLdScripts data={[courseLd, breadcrumbLd]} />

      <LearnIndex sections={getTutorialSections()} levels={LEARN_LEVELS} heroDescription={content.heroDescription || DESCRIPTION} originalEyebrow={content.heroEyebrow} originalTitle={content.heroTitle || content.title} tags={content.tags} whyTitle={content.whyTitle} whyBody={content.whyBody} />
    </SiteLayout>
  );
}
