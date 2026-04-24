import Link from "next/link";

interface SiteLayoutProps {
  children: React.ReactNode;
  activeNav?: "tools" | "learn" | "about";
}

export function SiteLayout({ children, activeNav }: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_30%),linear-gradient(180deg,_#07111b_0%,_#0b1320_100%)] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-300 focus:text-slate-950 focus:rounded-md focus:font-medium"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111b]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white hover:text-cyan-200 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none rounded">
            JSON Prism
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <Link
              href="/tools/"
              className={`transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none rounded ${activeNav === "tools" ? "text-cyan-200 font-medium" : ""}`}
            >
              Tools
            </Link>
            <Link
              href="/learn/"
              className={`transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none rounded ${activeNav === "learn" ? "text-cyan-200 font-medium" : ""}`}
            >
              Learn
            </Link>
            <Link
              href="/about/"
              className={`transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none rounded ${activeNav === "about" ? "text-cyan-200 font-medium" : ""}`}
            >
              About
            </Link>
            <Link
              href="/"
              className="rounded-full bg-cyan-300 px-4 py-2 font-medium text-slate-950 transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none"
            >
              Open App
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {children}
      </main>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-400">
        <p className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/" className="hover:text-cyan-200 transition-colors font-medium text-white">JSON Prism</Link>
          <span className="text-white/20">·</span>
          <Link href="/tools/" className="hover:text-cyan-200 transition-colors">Tools</Link>
          <span className="text-white/20">·</span>
          <Link href="/learn/" className="hover:text-cyan-200 transition-colors">Learn</Link>
          <span className="text-white/20">·</span>
          <Link href="/about/" className="hover:text-cyan-200 transition-colors">About</Link>
          <span className="text-white/20">·</span>
          <Link href="/privacy/" className="hover:text-cyan-200 transition-colors">Privacy</Link>
          <span className="text-white/20">·</span>
          <Link href="/terms/" className="hover:text-cyan-200 transition-colors">Terms</Link>
        </p>
        <p className="mt-3 text-xs text-slate-500">No data stored. Runs in your browser.</p>
      </footer>
    </div>
  );
}
