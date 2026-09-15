"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AppRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`${qs ? `/?${qs}` : "/"}${window.location.hash}`);
  }, [router, searchParams]);

  return null;
}
