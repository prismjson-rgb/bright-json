import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow } from "@/components/site/SitePrimitives";
import { ToolDirectory } from "@/components/site/ToolDirectory";
import { getAllTools } from "@/lib/tool-content";
import { getToolsIndexContent } from "@/lib/site-content";

export function ToolIndexPage() {
  const tools = getAllTools();
  const content = getToolsIndexContent();

  return (
    <SiteLayout activeNav="tools" contentDesign>
      <div className="learn-index-inner home-guide">
        <section className="learn-hero tool-index-hero">
          <div className="learn-hero-copy">
            {content.heroEyebrow && <Eyebrow>{content.heroEyebrow}</Eyebrow>}
            <h1>{content.heroTitle || content.title}</h1>
            <p className="learn-hero-description">{content.heroDescription}</p>
            <div className="learn-hero-actions">
              <Link href="/" className="learn-button-primary">
                Open the workspace <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
          <div className="learn-diagnostic">
            <div className="learn-card-heading">
              <span className="learn-accent-dot" />
              Tool directory
            </div>
            <div className="learn-diagnostic-body">
              <p className="tool-index-summary">
                Every tool page routes straight into the matching workspace mode.
              </p>
            </div>
          </div>
        </section>

        <section className="learn-lessons" aria-labelledby="tool-directory-title">
          <div className="learn-lessons-top">
            <h2 id="tool-directory-title" className="learn-eyebrow">
              {tools.length} tools
            </h2>
          </div>
          <ToolDirectory tools={tools} />
        </section>
      </div>
    </SiteLayout>
  );
}
