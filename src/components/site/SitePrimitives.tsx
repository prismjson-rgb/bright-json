export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`learn-eyebrow ${className}`}>{children}</p>;
}
