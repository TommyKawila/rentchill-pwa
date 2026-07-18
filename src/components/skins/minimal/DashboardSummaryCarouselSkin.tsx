"use client";

import { useLocale } from "@/components/LocaleProvider";
import type {
  DashboardOccupancyMetrics,
  DashboardRevenueMetrics,
} from "@/services/dashboardMetricsService";

interface DashboardSummaryCarouselSkinProps {
  billingMonthLabel: string;
  revenue: DashboardRevenueMetrics;
  occupancy: DashboardOccupancyMetrics;
  maintenanceWaiting: number;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

export function DashboardSummaryCarouselSkin({
  billingMonthLabel,
  revenue,
  occupancy,
  maintenanceWaiting,
}: DashboardSummaryCarouselSkinProps) {
  const { t } = useLocale();

  const cards = [
    {
      key: "revenue",
      label: t("owner.dashboard.carousel.revenue", { month: billingMonthLabel }),
      value: `฿${formatAmount(revenue.collected)} / ฿${formatAmount(revenue.target)}`,
      progress: revenue.progress,
    },
    {
      key: "occupancy",
      label: t("owner.dashboard.carousel.occupancy"),
      value: t("owner.dashboard.carousel.occupancyValue", {
        occupied: occupancy.occupied,
        total: occupancy.total,
      }),
    },
    {
      key: "maintenance",
      label: t("owner.dashboard.carousel.maintenance"),
      value: t("owner.dashboard.carousel.maintenanceValue", {
        count: maintenanceWaiting,
      }),
    },
  ];

  return (
    <section
      aria-label={t("owner.dashboard.carousel.ariaLabel")}
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {cards.map((card) => (
        <article
          key={card.key}
          className="min-h-[110px] w-[calc(100%-24px)] shrink-0 snap-start rounded-xl border border-zinc-100 bg-white p-4"
        >
          <p className="text-sm text-zinc-500">{card.label}</p>
          <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-rc-text">
            {card.value}
          </p>
          {card.progress != null && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-rc-success transition-all"
                style={{ width: `${Math.round(card.progress * 100)}%` }}
              />
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
