import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getAllTools } from "@/lib/tool-content";
import { getTutorialSections } from "@/lib/learn-content";

interface SiteLayoutProps {
  children: React.ReactNode;
  activeNav?: "tools" | "learn" | "about";
}

export function SiteLayout({ children, activeNav }: SiteLayoutProps) {
  const tools = getAllTools();
  const learnSections = getTutorialSections().slice(0, 8);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,_#07111b_0%,_#0b1320_100%)] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-300 focus:text-slate-950 focus:rounded-full focus:font-semibold"
      >
        Skip to content
      </a>

      <SiteHeader activeNav={activeNav} />

      <main id="main-content">{children}</main>

      {/* ── Full footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07]" aria-label="Site footer">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          {/* Top grid: brand + nav columns */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link
                href="/"
                className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
                aria-label="JSON Prism home"
              >
                <Image
                  src="/logo-transparent.png"
                  alt="JSON Prism logo"
                  width={34}
                  height={28}
                  className="shrink-0"
                />
                <span className="font-bold text-base text-white tracking-tight">JSON Prism</span>
              </Link>
              <p className="mt-3 text-sm text-slate-500 leading-6 max-w-[200px]">
                Free JSON workspace that runs entirely in your browser. No sign-up, no uploads.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-200 transition-colors"
              >
                Open App →
              </Link>
            </div>

            {/* Tools column 1 */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Tools
              </p>
              <ul className="space-y-2.5">
                {tools.slice(0, Math.ceil(tools.length / 2)).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}/`}
                      className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools column 2 */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                More tools
              </p>
              <ul className="space-y-2.5">
                {tools.slice(Math.ceil(tools.length / 2)).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}/`}
                      className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn + Company */}
            <div className="space-y-8">
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Learn JSON
                </p>
                <ul className="space-y-2.5">
                  {learnSections.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/learn/${s.id}/`}
                        className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/learn/"
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                    >
                      All tutorials →
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Company
                </p>
                <ul className="space-y-2.5">
                  <li>
                    <Link href="/about/" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy/" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms/" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} JSON Prism · All rights reserved</p>
            <p>No data stored · Runs entirely in your browser</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
