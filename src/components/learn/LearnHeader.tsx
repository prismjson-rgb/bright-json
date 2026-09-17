"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LearnProgressMeter } from "./LearnProgress";

export function LearnHeader({ ids }: { ids: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const article = pathname !== "/learn/" && pathname !== "/learn/errors/";
  const links = [
    { href: "/learn/", label: "Learn index", current: pathname === "/learn/" },
    { href: article ? pathname : "/learn/what-is-json/", label: "Lesson page", current: article },
    { href: "/learn/errors/", label: "Error hub", current: pathname === "/learn/errors/" },
  ];
  return (
    <header className="learn-header">
      <div className="learn-header-inner">
        <Link href="/" className="learn-brand" aria-label="JSON Prism home"><Image src="/logo-transparent.png" width={24} height={24} alt="" /> <span>JSON Prism</span></Link>
        <nav aria-label="Learn navigation" className="learn-header-nav">
          {links.map((link) => <Link key={link.label} href={link.href} aria-current={link.current ? "page" : undefined}>{link.label}</Link>)}
        </nav>
        <LearnProgressMeter ids={ids} />
        <Link href="/" className="learn-open-app">Open app</Link>
        <button type="button" className="learn-menu-button" aria-label={open ? "Close Learn menu" : "Open Learn menu"} aria-expanded={open} aria-controls="learn-mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
      </div>
      {open && <nav id="learn-mobile-navigation" aria-label="Mobile Learn navigation" className="learn-mobile-menu">{links.map((link) => <Link key={link.label} href={link.href} aria-current={link.current ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}</nav>}
    </header>
  );
}
