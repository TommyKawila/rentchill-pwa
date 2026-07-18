"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { AnalyticsSummary } from "@/services/analyticsCashflowService";

interface AnalyticsSummaryCardsSkinProps {
  summary: AnalyticsSummary;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

export function AnalyticsSummaryCardsSkin({ summary }: AnalyticsSummaryCardsSkinProps) {
  const { t } = useLocale();

  const cards = [
    {
      key: "revenue",
      label: t("owner.analytics.summary.revenue"),
      value: `฿${formatAmount(summary.grossRevenue)}`,
      cell: "border-rc-success/30 bg-rc-success-soft",
      valueClass: "text-rc-success-ink",
    },
    {
      key: "expenses",
      label: t("owner.analytics.summary.expenses"),
      value: `฿${formatAmount(summary.totalExpenses)}`,
      cell:
        summary.totalExpenses > 0
          ? "border-red-200 bg-red-50"
          : "border-zinc-100 bg-white",
      valueClass: summary.totalExpenses > 0 ? "text-red-700" : "text-zinc-900",
    },
    {
      key: "net",
      label: t("owner.analytics.summary.netProfit"),
      value: `฿${formatAmount(summary.netProfit)}`,
      cell:
        summary.netProfit >= 0
          ? "border-rc-success/30 bg-rc-success-soft"
          : "border-red-200 bg-red-50",
      valueClass:
        summary.netProfit >= 0 ? "text-rc-success-ink font-bold" : "text-red-700 font-bold",
    },
    {
      key: "occupancy",
      label: t("owner.analytics.summary.occupancy"),
      value: `${summary.occupancyRate}%`,
      hint: t("owner.analytics.summary.occupancyHint"),
      cell: "border-rc-green/30 bg-rc-green-soft",
      valueClass: "text-rc-green-ink",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5">
      {cards.map((card) => (
        <article key={card.key} className={`rounded-xl border p-4 ${card.cell}`}>
          <p className="text-sm text-zinc-500">{card.label}</p>
          <p className={`mt-2 text-2xl tabular-nums tracking-tight ${card.valueClass}`}>
            {card.value}
          </p>
          {card.hint ? <p className="mt-1 text-xs text-zinc-500">{card.hint}</p> : null}
        </article>
      ))}
    </section>
  );
}
