"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface SiteHeaderProps {
  activeNav?: "tools" | "learn" | "about";
}

const linkBase =
  "transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none rounded";

export function SiteHeader({ activeNav }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  const active = (nav: string) =>
    activeNav === nav ? "text-cyan-200 font-medium" : "";

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111b]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 min-w-0 ${linkBase}`}
          aria-label="JSON Prism home"
        >
          <Image
            src="/logo-transparent.png"
            alt="JSON Prism logo"
            width={34}
            height={28}
            className="shrink-0"
            priority
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm tracking-tight text-white leading-none">
              JSON Prism
            </span>
            <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
              Format · Diff · Transform
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link href="/tools/" className={`${linkBase} ${active("tools")}`}>Tools</Link>
          <Link href="/learn/" className={`${linkBase} ${active("learn")}`}>Learn</Link>
          <Link href="/about/" className={`${linkBase} ${active("about")}`}>About</Link>
          <Link
            href="/"
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none"
          >
            Open App
          </Link>
        </nav>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/"
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none"
          >
            Open App
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-md p-2 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav
          className="md:hidden border-t border-white/10 bg-[#07111b] px-4 py-3 space-y-1"
          aria-label="Mobile navigation"
        >
          {[
            { href: "/tools/", label: "Tools", nav: "tools" },
            { href: "/learn/", label: "Learn", nav: "learn" },
            { href: "/about/", label: "About", nav: "about" },
          ].map(({ href, label, nav }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.05] hover:text-cyan-200 ${
                activeNav === nav
                  ? "text-cyan-200 bg-white/[0.03]"
                  : "text-slate-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
