"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AnalyticsExportSkin } from "@/components/skins/minimal/AnalyticsExportSkin";
import { AnalyticsFilterSkin } from "@/components/skins/minimal/AnalyticsFilterSkin";
import { AnalyticsInsightsSkin } from "@/components/skins/minimal/AnalyticsInsightsSkin";
import { AnalyticsMonthlyChartSkin } from "@/components/skins/minimal/AnalyticsMonthlyChartSkin";
import { AnalyticsSummaryCardsSkin } from "@/components/skins/minimal/AnalyticsSummaryCardsSkin";
import { OwnerBottomNavSkin } from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import type { AnalyticsTimeframe } from "@/services/analyticsCashflowService";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";

function AnalyticsContent() {
  const { t } = useLocale();
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

  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("this_year");
  const [scopeProperty, setScopeProperty] = useState("portfolio");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (propertiesStatus !== "idle" || properties.length === 0) return;
    if (!propertySlug) return;
    if (slugFromUrl === propertySlug) return;
    router.replace(`/analytics?property=${encodeURIComponent(propertySlug)}`);
  }, [propertiesStatus, properties.length, slugFromUrl, propertySlug, router]);

  const analytics = useAnalytics({
    timeframe,
    propertySlug: scopeProperty === "portfolio" ? "portfolio" : scopeProperty,
    roomId,
  });

  const handlePropertyChange = (slug: string) => {
    setScopeProperty(slug);
    setRoomId("");
    if (slug !== "portfolio" && propertySlug) {
      router.replace(`/analytics?property=${encodeURIComponent(slug)}`);
    }
  };

  return (
    <main className="min-h-screen bg-rc-bg px-4 py-6 pb-24 text-rc-text">
      <div id="analytics-report" className="mx-auto max-w-xl space-y-6">
        <header>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {t("owner.analytics.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{t("owner.analytics.subtitle")}</p>
        </header>

        <AnalyticsFilterSkin
          timeframe={timeframe}
          propertySlug={scopeProperty}
          roomId={roomId}
          properties={properties}
          rooms={analytics.report?.filterRooms ?? []}
          onTimeframeChange={setTimeframe}
          onPropertyChange={handlePropertyChange}
          onRoomChange={setRoomId}
        />

        {analytics.status === "loading" && !analytics.report && (
          <p className="text-base text-zinc-500">{t("common.loading")}</p>
        )}

        {analytics.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {analytics.error}
          </p>
        )}

        {analytics.report && (
          <>
            <AnalyticsSummaryCardsSkin summary={analytics.report.summary} />
            <AnalyticsMonthlyChartSkin
              monthly={analytics.report.monthly}
              propertySlug={scopeProperty}
            />
            <AnalyticsInsightsSkin
              topRooms={analytics.report.topRooms}
              expenseByCategory={analytics.report.expenseByCategory}
            />
            <AnalyticsExportSkin
              disabled={analytics.status === "loading"}
              exporting={analytics.status === "exporting"}
              onExportExcel={() => void analytics.exportExcel()}
              onPrint={() => window.print()}
            />
          </>
        )}
      </div>

      <OwnerBottomNavSkin activeTab="accounting" propertySlug={propertySlug} />
      <OwnerPushNotificationPrompts />
    </main>
  );
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
      <AnalyticsContent />
    </Suspense>
  );
}
