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
      label: t("owner.analytics.summary.revenue"),
      value: `฿${formatAmount(summary.grossRevenue)}`,
      tone: "text-rc-success",
    },
    {
      label: t("owner.analytics.summary.expenses"),
      value: `฿${formatAmount(summary.totalExpenses)}`,
      tone: "text-rc-danger",
    },
    {
      label: t("owner.analytics.summary.netProfit"),
      value: `฿${formatAmount(summary.netProfit)}`,
      tone: "text-rc-success font-bold",
    },
    {
      label: t("owner.analytics.summary.occupancy"),
      value: `${summary.occupancyRate}%`,
      tone: "text-zinc-900",
      hint: t("owner.analytics.summary.occupancyHint"),
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border border-zinc-100 bg-white p-4"
        >
          <p className="text-sm text-zinc-500">{card.label}</p>
          <p className={`mt-2 text-2xl tabular-nums tracking-tight ${card.tone}`}>
            {card.value}
          </p>
          {card.hint && (
            <p className="mt-1 text-xs text-zinc-400">{card.hint}</p>
          )}
        </article>
      ))}
    </section>
  );
}
