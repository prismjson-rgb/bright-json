"use client";

const SIDEBAR_WIDTH = "w-full max-w-md sm:max-w-lg";

interface OverlaySidebarProps {
  open: boolean;
  onClose: () => void;
  "aria-label": string;
  children: React.ReactNode;
}

export default function OverlaySidebar({
  open,
  onClose,
  "aria-label": ariaLabel,
  children,
}: OverlaySidebarProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <aside
        data-state="open"
        className={`relative ml-auto ${SIDEBAR_WIDTH} h-full bg-surface1 border-l border-border shadow-2xl flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  );
}
