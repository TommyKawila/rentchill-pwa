"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { AnalyticsExportSkin } from "@/components/skins/minimal/AnalyticsExportSkin";
import { AnalyticsFilterSkin } from "@/components/skins/minimal/AnalyticsFilterSkin";
import { AnalyticsInsightsSkin } from "@/components/skins/minimal/AnalyticsInsightsSkin";
import { AnalyticsMonthlyChartSkin } from "@/components/skins/minimal/AnalyticsMonthlyChartSkin";
import { AnalyticsSummaryCardsSkin } from "@/components/skins/minimal/AnalyticsSummaryCardsSkin";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { AnalyticsTimeframe } from "@/services/analyticsCashflowService";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface AnalyticsReportPanelSkinProps {
  properties: OwnerPropertyOption[];
  defaultPropertySlug: string;
  showHeader?: boolean;
}

export function AnalyticsReportPanelSkin({
  properties,
  defaultPropertySlug,
  showHeader = true,
}: AnalyticsReportPanelSkinProps) {
  const { t } = useLocale();
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("this_year");
  const [scopeProperty, setScopeProperty] = useState(defaultPropertySlug);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    setScopeProperty(defaultPropertySlug);
    setRoomId("");
  }, [defaultPropertySlug]);

  const analytics = useAnalytics({
    timeframe,
    propertySlug: scopeProperty === "portfolio" ? "portfolio" : scopeProperty,
    roomId,
  });

  return (
    <div id="analytics-report" className="space-y-4">
      {showHeader ? (
        <header>
          <h2 className="text-base font-bold text-rc-text">
            {t("owner.accounting.analyticsLink")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{t("owner.analytics.subtitle")}</p>
        </header>
      ) : null}

      <AnalyticsFilterSkin
        timeframe={timeframe}
        propertySlug={scopeProperty}
        roomId={roomId}
        properties={properties}
        rooms={analytics.report?.filterRooms ?? []}
        onTimeframeChange={setTimeframe}
        onPropertyChange={(slug) => {
          setScopeProperty(slug);
          setRoomId("");
        }}
        onRoomChange={setRoomId}
      />

      {analytics.status === "loading" && !analytics.report && (
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
      )}

      {analytics.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {analytics.error}
        </p>
      ) : null}

      {analytics.report ? (
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
      ) : null}
    </div>
  );
}
