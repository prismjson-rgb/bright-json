import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function ContentBreadcrumb({ items, className = "" }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`learn-breadcrumb ${className}`}>
      {items.map((item, index) => (
        <span key={`${item.label}-${item.href ?? index}`} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={12} aria-hidden />}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
