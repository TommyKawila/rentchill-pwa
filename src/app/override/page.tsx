"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OverrideRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";

  useEffect(() => {
    router.replace(`/dashboard?property=${encodeURIComponent(propertySlug)}`);
  }, [router, propertySlug]);

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      กำลังโหลด...
    </main>
  );
}

export default function OverridePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          กำลังโหลด...
        </main>
      }
    >
      <OverrideRedirect />
    </Suspense>
  );
}
