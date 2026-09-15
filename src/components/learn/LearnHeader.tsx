"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LearnProgressMeter } from "./LearnProgress";

export function LearnHeader({ ids }: { ids: string[] }) {
  const pathname = usePathname();
  const article = pathname !== "/learn/" && pathname !== "/learn/errors/";
  return (
    <header className="learn-header">
      <div className="learn-header-inner">
        <Link href="/" className="learn-brand" aria-label="JSON Prism home"><Image src="/logo-transparent.png" width={24} height={24} alt="" /> <span>JSON Prism</span></Link>
        <nav aria-label="Learn navigation" className="learn-header-nav">
          <Link href="/learn/" aria-current={pathname === "/learn/" ? "page" : undefined}>Learn index</Link>
          <Link href={article ? pathname : "/learn/what-is-json/"} aria-current={article ? "page" : undefined}>Lesson page</Link>
          <Link href="/learn/errors/" aria-current={pathname === "/learn/errors/" ? "page" : undefined}>Error hub</Link>
        </nav>
        <LearnProgressMeter ids={ids} />
        <Link href="/" className="learn-open-app">Open app</Link>
      </div>
    </header>
  );
}
