import { getAllTools } from "@/lib/tool-content";
import { ToolIndexPage } from "@/components/site/ToolIndexPage";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const TITLE = "JSON Tools - Formatter, Validator, Diff & More | JSON Prism";
const DESCRIPTION =
  `Free online JSON tools: format, validate, diff, convert, and debug JSON in your browser. No install, no sign-up. ${getAllTools().length} tools in one workspace.`;

export const metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/tools/",
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools/" },
]);

export default function ToolsPage() {
  return (
    <>
      <JsonLdScripts data={[breadcrumbLd]} />
      <ToolIndexPage />
    </>
  );
}
