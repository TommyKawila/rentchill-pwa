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

const DONUT_COLORS = [
  "var(--color-rc-green)",
  "var(--color-rc-warning)",
  "#d97706",
  "var(--color-rc-green-dark)",
  "#a1a1aa",
];

const SIZE = 128;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 42;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * R;
const SEGMENT_GAP = 2;

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH");
}

function ExpenseDonut({ rows }: { rows: AnalyticsExpenseCategory[] }) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const track = (
    <circle
      cx={CX}
      cy={CY}
      r={R}
      fill="none"
      stroke="#f4f4f5"
      strokeWidth={STROKE}
    />
  );

  if (total <= 0) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        {track}
      </svg>
    );
  }

  let accumulated = 0;
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
      {track}
      {rows.map((row, index) => {
        const ratio = row.amount / total;
        const dash = Math.max(0, ratio * CIRCUMFERENCE - SEGMENT_GAP);
        const rotation = accumulated * 360 - 90 + SEGMENT_GAP / 2;
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
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            transform={`rotate(${rotation} ${CX} ${CY})`}
          />
        );
      })}
    </svg>
  );
}

function rankTone(index: number) {
  if (index === 0) {
    return "bg-rc-green text-white";
  }
  return "bg-zinc-100 text-zinc-700";
}

export function AnalyticsInsightsSkin({
  topRooms,
  expenseByCategory,
}: AnalyticsInsightsSkinProps) {
  const { t } = useLocale();
  const expenseTotal = expenseByCategory.reduce((sum, row) => sum + row.amount, 0);

  return (
    <section className="space-y-3">
      <article className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
        <h2 className="text-base font-semibold text-rc-text">
          {t("owner.analytics.topRooms.title")}
        </h2>
        {topRooms.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">{t("owner.analytics.topRooms.empty")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {topRooms.map((room, index) => (
              <li
                key={room.roomId}
                className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-white px-3 py-2.5"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${rankTone(index)}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {room.propertyName} · {t("common.room", { number: room.roomNumber })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t("owner.analytics.topRooms.net")} ฿{formatAmount(room.netProfit)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-rc-success-ink">
                  ฿{formatAmount(room.revenue)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
        <h2 className="text-base font-semibold text-rc-text">
          {t("owner.analytics.expenseBreakdown.title")}
        </h2>
        {expenseByCategory.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            {t("owner.analytics.expenseBreakdown.empty")}
          </p>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="absolute inset-3 rounded-full bg-white shadow-sm ring-1 ring-zinc-100" />
              <ExpenseDonut rows={expenseByCategory} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-base font-bold tabular-nums text-rc-text">
                  ฿{formatAmount(expenseTotal)}
                </p>
              </div>
            </div>
            <ul className="w-full space-y-2">
              {expenseByCategory.map((row, index) => (
                <li
                  key={row.category}
                  className="flex min-h-10 items-center gap-2 rounded-lg border border-zinc-100 bg-white px-3 text-sm"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-zinc-600">
                    {t(CATEGORY_KEYS[row.category] as Parameters<typeof t>[0])}
                  </span>
                  <span className="shrink-0 tabular-nums text-zinc-900">
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
