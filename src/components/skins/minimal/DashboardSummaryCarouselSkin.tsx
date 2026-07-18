"use client";

import Link from "next/link";
import { ChevronRight, TrendingUp, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatMoney } from "@/services/formatMoney";
import type {
  DashboardOccupancyMetrics,
  DashboardRevenueMetrics,
} from "@/services/dashboardMetricsService";

interface DashboardSummaryCarouselSkinProps {
  billingMonthLabel: string;
  revenue: DashboardRevenueMetrics;
  occupancy: DashboardOccupancyMetrics;
  maintenanceWaiting: number;
  maintenanceHref?: string;
}

export function DashboardSummaryCarouselSkin({
  billingMonthLabel,
  revenue,
  occupancy,
  maintenanceWaiting,
  maintenanceHref,
}: DashboardSummaryCarouselSkinProps) {
  const { t, locale } = useLocale();
  const outstanding = Math.max(0, revenue.target - revenue.collected);
  const occupancyPct =
    occupancy.total > 0
      ? Math.round((occupancy.occupied / occupancy.total) * 100)
      : 0;

  return (
    <section
      aria-label={t("owner.dashboard.carousel.ariaLabel")}
      className="space-y-3"
    >
      <article className="rounded-xl bg-gradient-to-br from-rc-green via-rc-green to-rc-green-dark p-4 text-white shadow-[0_4px_16px_-4px_rgba(13,148,136,0.45)]">
        <p className="text-xs text-white/70">
          {t("owner.dashboard.carousel.monthlySummary")} · {billingMonthLabel}
        </p>
        <p className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">
          {formatMoney(revenue.target, "THB", locale)}
        </p>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-lg bg-white/10 px-3 py-2">
            <p className="text-[10px] text-white/60">
              {t("owner.dashboard.carousel.collected")}
            </p>
            <p className="text-sm font-bold tabular-nums text-rc-success">
              {formatMoney(revenue.collected, "THB", locale)}
            </p>
          </div>
          <div className="flex-1 rounded-lg bg-white/10 px-3 py-2">
            <p className="text-[10px] text-white/60">
              {t("owner.dashboard.carousel.outstanding")}
            </p>
            <p className="text-sm font-bold tabular-nums text-white">
              {formatMoney(outstanding, "THB", locale)}
            </p>
          </div>
        </div>
        {revenue.target > 0 && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-rc-success transition-all"
              style={{ width: `${Math.round(revenue.progress * 100)}%` }}
            />
          </div>
        )}
      </article>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-xl border border-zinc-100 bg-white p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-rc-green" aria-hidden />
            <p className="text-[10px] text-zinc-500">
              {t("owner.dashboard.carousel.occupancy")}
            </p>
          </div>
          <p className="text-xl font-extrabold tabular-nums text-rc-text">
            {occupancyPct}%
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-500">
            {t("owner.dashboard.carousel.occupancyValue", {
              occupied: occupancy.occupied,
              total: occupancy.total,
            })}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-100 bg-white p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-rc-green" aria-hidden />
            <p className="text-[10px] text-zinc-500">
              {t("owner.dashboard.carousel.maintenance")}
            </p>
          </div>
          <p className="text-xl font-extrabold tabular-nums text-rc-text">
            {maintenanceWaiting}
          </p>
          {maintenanceHref ? (
            <Link
              href={maintenanceHref}
              className="mt-0.5 inline-flex min-h-8 items-center gap-0.5 text-[10px] font-semibold text-rc-green"
            >
              {t("owner.dashboard.carousel.viewRepairs")}
              <ChevronRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : (
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {t("owner.dashboard.carousel.maintenanceValue", {
                count: maintenanceWaiting,
              })}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
