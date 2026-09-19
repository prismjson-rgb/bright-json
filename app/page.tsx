import AppShell from "@/components/AppShell";
import { HomePageSEOContent } from "@/components/site/HomePageSEOContent";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { getHomeContent } from "@/lib/site-content";
import { getAllTools } from "@/lib/tool-content";
import {
  buildMetadata,
  faqJsonLd,
  itemListJsonLd,
  organizationJsonLd,
  siteUrl,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const toolCount = getAllTools().length;
const home = getHomeContent();

export const metadata = buildMetadata({
  title: `JSON Prism | All-in-One JSON Toolkit - ${toolCount} Free Tools`,
  description: `Format, validate, edit, diff, and convert JSON in one free browser-based workspace. ${toolCount} tools, no sign-up, local processing with optional sharing.`,
  path: "/",
  ogTitle: "JSON Prism - The Free All-in-One JSON Toolkit",
  ogDescription: `Format, validate, edit, diff, and convert JSON in one free browser-based workspace. ${toolCount} tools, no sign-up, local processing with optional sharing.`,
  twitterTitle: "JSON Prism - The Free All-in-One JSON Toolkit",
  twitterDescription: `Format, validate, edit, diff, and convert JSON in one free browser-based workspace. ${toolCount} tools, no sign-up, local processing with optional sharing.`,
  imageAlt: "JSON Prism - JSON workspace in your browser",
});

export default function HomePage() {
  const tools = getAllTools();

  const softwareLd = softwareApplicationJsonLd({
    name: "JSON Prism",
    description: home.metaDescription || "",
    path: "/",
    features: tools.map((tool) => tool.title),
    imageUrl: `${siteUrl()}/icons/icon-512.png`,
  });

  const organizationLd = organizationJsonLd();
  const websiteLd = websiteJsonLd(home.metaDescription || "");
  const itemListLd = itemListJsonLd(
    tools.map((tool) => ({ name: tool.title, url: siteUrl(`/tools/${tool.slug}/`) }))
  );
  const faqLd = home.faqs.length > 0 ? faqJsonLd(home.faqs) : null;

  return (
    <>
      <JsonLdScripts data={[softwareLd, organizationLd, websiteLd, itemListLd, faqLd]} />

      {/* App workspace - fills the viewport (h-screen) */}
      <AppShell />

      {/* SEO/AEO content - below the fold, visible on scroll */}
      <HomePageSEOContent />
    </>
  );
}


