import Link from "next/link";
import { Braces } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background text-foreground">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Braces className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
      <Link
        href="/"
        className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      >
        Back to JSON Viewer
      </Link>
    </div>
  );
}
