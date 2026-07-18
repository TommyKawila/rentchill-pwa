"use client";

import { useLocale } from "@/components/LocaleProvider";
import { formatMoney } from "@/services/formatMoney";
import type { CashFlowBentoMetrics } from "@/services/dashboardMetricsService";

interface CashFlowBentoSkinProps {
  metrics: CashFlowBentoMetrics;
  loading?: boolean;
}

export function CashFlowBentoSkin({ metrics, loading }: CashFlowBentoSkinProps) {
  const { t, locale } = useLocale();

  const netClass =
    metrics.netCashFlow >= 0 ? "text-rc-success" : "text-rc-danger";

  return (
    <div className="hidden md:grid md:grid-cols-3 md:gap-4">
      <div className="rounded-xl border border-zinc-100 bg-white p-6 md:col-span-1">
        <p className="text-sm text-zinc-500">{t("owner.bento.netCashFlow")}</p>
        {loading ? (
          <div className="mt-2 h-9 w-32 animate-pulse rounded bg-zinc-100" />
        ) : (
          <p
            className={`mt-1 text-3xl font-bold tracking-tight text-zinc-950 ${netClass}`}
          >
            {formatMoney(metrics.netCashFlow, "THB", locale)}
          </p>
        )}
      </div>

      <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white md:col-span-2">
        <div className="p-6">
          <p className="text-sm text-zinc-500">
            {t("owner.bento.expectedRevenue")}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-zinc-100" />
          ) : (
            <p className="mt-1 text-xl font-bold text-zinc-900">
              {formatMoney(metrics.expectedRevenue, "THB", locale)}
            </p>
          )}
        </div>
        <div className="p-6">
          <p className="text-sm text-zinc-500">{t("owner.bento.rentalYield")}</p>
          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded bg-zinc-100" />
          ) : metrics.rentalYieldPct != null ? (
            <p className="mt-1 text-xl font-bold text-zinc-900">
              {metrics.rentalYieldPct.toLocaleString(locale === "en" ? "en-US" : "th-TH")}%
            </p>
          ) : (
            <p className="mt-1 text-base text-zinc-500">{t("owner.bento.yieldUnset")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
