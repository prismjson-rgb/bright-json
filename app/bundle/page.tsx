import BundleViewerWrapper from "@/components/BundleViewerWrapper";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const TITLE = "JSON Bundle Viewer - JSON Prism";
const DESCRIPTION =
  "View and explore a shared JSON bundle. All data is decoded and rendered entirely in your browser - nothing is stored or transmitted.";

export const metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/bundle/",
  twitterDescription:
    "View and explore a shared JSON bundle. Runs entirely in your browser.",
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Bundle Viewer", path: "/bundle/" },
]);

export default function BundlePage() {
  return (
    <>
      <JsonLdScripts data={[breadcrumbLd]} />
      <BundleViewerWrapper />
    </>
  );
}
