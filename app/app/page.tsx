// app/app/page.tsx  — Server Component exports metadata
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppRedirect } from "./AppRedirect";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <AppRedirect />
    </Suspense>
  );
}
