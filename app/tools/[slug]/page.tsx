import { notFound } from "next/navigation";
import { ToolLandingPage } from "@/components/site/ToolLandingPage";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-content";
import { getToolFaqs } from "@/lib/tool-faqs";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return { title: "Not Found" };
  }

  return buildMetadata({
    title: tool.metaTitle || `${tool.title} | JSON Prism`,
    description: tool.metaDescription || tool.summary || "",
    path: `/tools/${slug}/`,
    type: "article",
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const faqs = getToolFaqs(tool);
  const description = tool.metaDescription || tool.summary || "";
  const path = `/tools/${slug}/`;

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools/" },
    { name: tool.title, path },
  ]);

  const pageLd = webPageJsonLd({
    name: tool.title,
    description,
    path,
    isPartOfPath: "/tools/",
  });

  const softwareLd = softwareApplicationJsonLd({
    name: tool.title,
    description,
    path,
    subCategory: tool.category || "JSON Tool",
    features: tool.highlights,
  });

  const faqLd = faqJsonLd(faqs);

  return (
    <>
      <JsonLdScripts data={[breadcrumbLd, pageLd, softwareLd, faqLd]} />
      <ToolLandingPage tool={tool} faqs={faqs} />
    </>
  );
}

