"use client";

import { useLocale } from "@/components/LocaleProvider";
import { AnalyticsReportPanelSkin } from "@/components/skins/minimal/AnalyticsReportPanelSkin";
import { BillingOverviewSkin } from "@/components/skins/minimal/BillingOverviewSkin";
import { BillingCommandCenterSkin } from "@/components/skins/minimal/BillingCommandCenterSkin";
import { CashFlowBentoSkin } from "@/components/skins/minimal/CashFlowBentoSkin";
import { RentFollowUpStatusSkin } from "@/components/skins/minimal/RentFollowUpStatusSkin";
import type { CashFlowBentoMetrics } from "@/services/dashboardMetricsService";
import type { BillingOverview } from "@/services/billingOverviewService";
import type { UnpaidReminderSummary } from "@/services/unpaidReminderSummaryService";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface AccountingHubSkinProps {
  propertySlug: string;
  properties: OwnerPropertyOption[];
  billingMonth: string;
  overview: BillingOverview;
  chillMode?: boolean;
  notIssued: number;
  readyCount: number;
  pendingMeterCount: number;
  includeUtilities: boolean;
  canBulkMeterDay: boolean;
  disabled?: boolean;
  saving?: boolean;
  onGoFillMeters: () => void;
  onBulkMeterDay: () => void;
  onBulkIssue: () => void;
  result?: { created: number; updated: number; skipped: number } | null;
  unpaidSummary: UnpaidReminderSummary;
  bentoMetrics?: CashFlowBentoMetrics;
  bentoLoading?: boolean;
}

export function AccountingHubSkin({
  propertySlug,
  properties,
  billingMonth,
  overview,
  chillMode,
  notIssued,
  readyCount,
  pendingMeterCount,
  includeUtilities,
  canBulkMeterDay,
  disabled,
  saving,
  onGoFillMeters,
  onBulkMeterDay,
  onBulkIssue,
  result,
  unpaidSummary,
  bentoMetrics,
  bentoLoading,
}: AccountingHubSkinProps) {
  const { t } = useLocale();

  return (
    <section id="billing" className="space-y-4">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-rc-text sm:text-2xl">
          {t("owner.nav.tab.accounting")}
        </h1>
      </header>

      {bentoMetrics && (
        <CashFlowBentoSkin metrics={bentoMetrics} loading={bentoLoading} />
      )}

      <BillingCommandCenterSkin
        notIssued={notIssued}
        readyCount={readyCount}
        pendingMeterCount={pendingMeterCount}
        includeUtilities={includeUtilities}
        canBulkMeterDay={canBulkMeterDay}
        disabled={disabled}
        saving={saving}
        onGoFillMeters={onGoFillMeters}
        onBulkMeterDay={onBulkMeterDay}
        onBulkIssue={onBulkIssue}
        result={result}
      />

      <RentFollowUpStatusSkin
        summary={unpaidSummary}
        propertySlug={propertySlug}
      />

      <div className="rounded-xl border border-zinc-100 bg-white p-6">
        <BillingOverviewSkin
          billingMonth={billingMonth}
          overview={overview}
          chillMode={chillMode}
        />
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white p-4">
        <AnalyticsReportPanelSkin
          properties={properties}
          defaultPropertySlug={propertySlug}
        />
      </div>
    </section>
  );
}
