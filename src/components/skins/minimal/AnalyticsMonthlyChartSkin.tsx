"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { AnalyticsMonthlyRow } from "@/services/analyticsCashflowService";

interface AnalyticsMonthlyChartSkinProps {
  monthly: AnalyticsMonthlyRow[];
  propertySlug: string;
}

const REVENUE_COLOR = "var(--color-rc-success)";
const EXPENSE_COLOR = "var(--color-rc-danger)";

function monthLabel(month: string, locale: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(locale, { month: "short" });
}

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

export function AnalyticsMonthlyChartSkin({
  monthly,
  propertySlug,
}: AnalyticsMonthlyChartSkinProps) {
  const { t, locale } = useLocale();
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  const maxValue = Math.max(
    1,
    ...monthly.flatMap((row) => [row.revenue, row.expense]),
  );
  const chartHeight = 180;
  const barWidth = 10;
  const gap = 6;
  const groupWidth = barWidth * 2 + gap;
  const width = monthly.length * (groupWidth + 12) + 24;
  const active = monthly.find((row) => row.month === activeMonth) ?? null;

  const billingHref = (month: string) => {
    const slug = propertySlug === "portfolio" ? "" : propertySlug;
    if (!slug) return `/dashboard#billing`;
    return `/dashboard?property=${encodeURIComponent(slug)}#billing`;
  };

  const maintenanceHref =
    propertySlug === "portfolio"
      ? "/maintenance"
      : `/maintenance?property=${encodeURIComponent(propertySlug)}`;

  return (
    <section className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-rc-text">
          {t("owner.analytics.chart.title")}
        </h2>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rc-success" />
            {t("owner.analytics.chart.revenue")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rc-danger" />
            {t("owner.analytics.chart.expense")}
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-100 bg-white p-3">
        <svg
          width={width}
          height={chartHeight + 28}
          viewBox={`0 0 ${width} ${chartHeight + 28}`}
          role="img"
          aria-label={t("owner.analytics.chart.title")}
        >
          <line
            x1={12}
            y1={chartHeight}
            x2={width - 12}
            y2={chartHeight}
            stroke="#e4e4e7"
            strokeWidth={1}
          />
          {monthly.map((row, index) => {
            const x = 16 + index * (groupWidth + 12);
            const revenueH = (row.revenue / maxValue) * chartHeight;
            const expenseH = (row.expense / maxValue) * chartHeight;
            const baseY = chartHeight;

            return (
              <g key={row.month}>
                <rect
                  x={x}
                  y={baseY - revenueH}
                  width={barWidth}
                  height={revenueH}
                  fill={REVENUE_COLOR}
                  rx={3}
                  className="cursor-pointer"
                  onClick={() => setActiveMonth(row.month)}
                />
                <rect
                  x={x + barWidth + gap}
                  y={baseY - expenseH}
                  width={barWidth}
                  height={expenseH}
                  fill={EXPENSE_COLOR}
                  rx={3}
                  className="cursor-pointer"
                  onClick={() => setActiveMonth(row.month)}
                />
                <text
                  x={x + groupWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  className="fill-zinc-500 text-[10px]"
                >
                  {monthLabel(row.month, locale)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {active && (
        <div className="mt-4 rounded-xl border border-zinc-100 bg-white p-4">
          <p className="text-sm font-medium text-rc-text">
            {monthLabel(active.month, locale)} {active.month.split("-")[0]}
          </p>
          <p className="mt-2 text-sm font-medium text-rc-success-ink">
            {t("owner.analytics.chart.revenue")}: ฿{formatAmount(active.revenue)}
          </p>
          <p className="text-sm font-medium text-red-700">
            {t("owner.analytics.chart.expense")}: ฿{formatAmount(active.expense)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={billingHref(active.month)}
              className="min-h-10 rounded-lg border border-rc-green/30 bg-rc-green-soft px-3 text-sm font-medium text-rc-green-ink"
            >
              {t("owner.analytics.chart.viewBills")}
            </a>
            <a
              href={maintenanceHref}
              className="min-h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800"
            >
              {t("owner.analytics.chart.viewMaintenance")}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
