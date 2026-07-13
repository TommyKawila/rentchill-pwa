"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AdminLoginFormSkin } from "@/components/skins/minimal/AdminLoginFormSkin";

function OwnerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("portal") === "platform") {
      const next = searchParams.get("next");
      const url = next
        ? `/admin/platform/login?next=${encodeURIComponent(next)}`
        : "/admin/platform/login";
      router.replace(url);
    }
  }, [router, searchParams]);

  if (searchParams.get("portal") === "platform") return null;

  return <AdminLoginFormSkin variant="owner" />;
}

function AdminLoginFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <OwnerLoginContent />
    </Suspense>
  );
}
