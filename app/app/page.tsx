// app/app/page.tsx  — Server Component exports metadata
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppRedirect } from "./AppRedirect";

export const metadata: Metadata = {
  title: "JSON Prism App",
  description:
    "Open the JSON Prism browser workspace to format, validate, diff, convert, and debug JSON privately with no sign-up.",
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <AppRedirect />
    </Suspense>
  );
}
