"use client";

import { BarChart3 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { BillingOverviewSkin } from "@/components/skins/minimal/BillingOverviewSkin";
import { BillingCommandCenterSkin } from "@/components/skins/minimal/BillingCommandCenterSkin";
import { CashFlowBentoSkin } from "@/components/skins/minimal/CashFlowBentoSkin";
import { RentFollowUpStatusSkin } from "@/components/skins/minimal/RentFollowUpStatusSkin";
import type { CashFlowBentoMetrics } from "@/services/dashboardMetricsService";
import type { BillingOverview } from "@/services/billingOverviewService";
import type { UnpaidReminderSummary } from "@/services/unpaidReminderSummaryService";

interface AccountingHubSkinProps {
  propertySlug: string;
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
  const analyticsHref = `/analytics?property=${encodeURIComponent(propertySlug)}`;

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

      <a
        href={analyticsHref}
        className="flex min-h-[88px] items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 transition-colors hover:bg-zinc-50"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rc-primary-soft text-rc-primary">
          <BarChart3 className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-rc-text">
            {t("owner.accounting.analyticsLink")}
          </p>
          <p className="text-sm text-zinc-500">{t("owner.analytics.subtitle")}</p>
        </div>
      </a>
    </section>
  );
}
