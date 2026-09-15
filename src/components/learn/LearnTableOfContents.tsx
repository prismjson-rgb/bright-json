"use client";

import { useEffect, useState } from "react";

interface Heading { id: string; label: string }

export function LearnTableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id || "");

  useEffect(() => {
    if (headings.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let next = headings[0].id;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 130) next = heading.id;
      }
      setActiveId((current) => current === next ? current : next);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [headings]);

  return <nav className="learn-side-card" aria-label="On this page"><h2>On this page</h2>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} aria-current={activeId === heading.id ? "location" : undefined}>{heading.label}</a>)}</nav>;
}
