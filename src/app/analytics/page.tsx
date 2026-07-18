"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";

function AnalyticsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");

  const { properties, status: propertiesStatus } = useOwnerProperties();
  const propertySlug = useMemo(
    () =>
      resolveOwnerPropertySlug(
        slugFromUrl,
        properties,
        propertiesStatus === "loading",
      ),
    [slugFromUrl, properties, propertiesStatus],
  );

  useEffect(() => {
    if (propertiesStatus !== "idle") return;
    if (properties.length === 0) {
      router.replace("/dashboard");
      return;
    }
    if (!propertySlug) return;
    router.replace(
      `/dashboard?property=${encodeURIComponent(propertySlug)}#billing`,
    );
  }, [propertiesStatus, properties.length, propertySlug, router]);

  return null;
}

export default function AnalyticsPage() {
  const { t } = useLocale();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          {t("common.loading")}
        </main>
      }
    >
      <AnalyticsRedirect />
    </Suspense>
  );
}
