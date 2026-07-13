"use client";

import { Suspense } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { AdminLoginFormSkin } from "@/components/skins/minimal/AdminLoginFormSkin";

function PlatformLoginFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function PlatformLoginPage() {
  return (
    <Suspense fallback={<PlatformLoginFallback />}>
      <AdminLoginFormSkin variant="platform" />
    </Suspense>
  );
}
