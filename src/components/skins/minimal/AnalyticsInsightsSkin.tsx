"use client";

import { useLocale } from "@/components/LocaleProvider";
import type {
  AnalyticsExpenseCategory,
  AnalyticsTopRoom,
} from "@/services/analyticsCashflowService";
import type { MaintenanceTicketCategory } from "@/services/types";

interface AnalyticsInsightsSkinProps {
  topRooms: AnalyticsTopRoom[];
  expenseByCategory: AnalyticsExpenseCategory[];
}

const CATEGORY_KEYS: Record<MaintenanceTicketCategory, string> = {
  ac: "owner.maintenance.category.ac",
  plumbing: "owner.maintenance.category.plumbing",
  electrical: "owner.maintenance.category.electrical",
  furniture: "owner.maintenance.category.furniture",
  other: "owner.maintenance.category.other",
};

const DONUT_COLORS = ["#0d9488", "#ea580c", "#d97706", "#0f766e", "#71717a"];

const SIZE = 120;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 40;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * R;

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

function ExpenseDonut({ rows }: { rows: AnalyticsExpenseCategory[] }) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  if (total <= 0) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={STROKE}
        />
      </svg>
    );
  }

  let accumulated = 0;
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
      {rows.map((row, index) => {
        const ratio = row.amount / total;
        const dash = ratio * CIRCUMFERENCE;
        const rotation = accumulated * 360 - 90;
        accumulated += ratio;
        return (
          <circle
            key={row.category}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
            strokeWidth={STROKE}
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            transform={`rotate(${rotation} ${CX} ${CY})`}
          />
        );
      })}
    </svg>
  );
}

export function AnalyticsInsightsSkin({
  topRooms,
  expenseByCategory,
}: AnalyticsInsightsSkinProps) {
  const { t } = useLocale();
  const expenseTotal = expenseByCategory.reduce((sum, row) => sum + row.amount, 0);

  return (
    <section className="space-y-4">
      <article className="rounded-xl border border-zinc-100 bg-white p-4">
        <h2 className="text-base font-semibold text-zinc-900">
          {t("owner.analytics.topRooms.title")}
        </h2>
        {topRooms.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">{t("owner.analytics.topRooms.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100">
            {topRooms.map((room, index) => (
              <li key={room.roomId} className="flex items-center gap-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {room.propertyName} · {t("common.room", { number: room.roomNumber })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t("owner.analytics.topRooms.net")} ฿{formatAmount(room.netProfit)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-rc-success">
                  ฿{formatAmount(room.revenue)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-xl border border-zinc-100 bg-white p-4">
        <h2 className="text-base font-semibold text-zinc-900">
          {t("owner.analytics.expenseBreakdown.title")}
        </h2>
        {expenseByCategory.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            {t("owner.analytics.expenseBreakdown.empty")}
          </p>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <ExpenseDonut rows={expenseByCategory} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-zinc-900">
                  ฿{formatAmount(expenseTotal)}
                </p>
              </div>
            </div>
            <ul className="w-full space-y-2 text-sm text-zinc-600">
              {expenseByCategory.map((row, index) => (
                <li key={row.category} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t(CATEGORY_KEYS[row.category] as Parameters<typeof t>[0])}
                  </span>
                  <span className="tabular-nums text-zinc-900">
                    {row.pct}% · ฿{formatAmount(row.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </section>
  );
}
