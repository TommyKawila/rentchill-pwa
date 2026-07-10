"use client";

import { useLocale } from "@/components/LocaleProvider";
import { formatMeterDate, formatMeterNumber } from "@/services/meterFormat";
import type { MeterHistoryMonthRow } from "@/services/meterReadingService";

interface MeterHistoryListProps {
  rows: MeterHistoryMonthRow[];
  loading?: boolean;
}

export function MeterHistoryList({ rows, loading }: MeterHistoryListProps) {
  const { t, locale } = useLocale();

  if (loading) {
    return (
      <p className="text-xs text-zinc-500">{t("owner.meter.historyLoading")}</p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-xs text-zinc-500">{t("owner.meter.historyEmpty")}</p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-zinc-900">
        {t("owner.meter.historyTitle")}
      </h4>
      <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {rows.map((row) => (
          <li key={row.label} className="px-3 py-2 text-xs">
            <p className="font-medium text-zinc-800">
              {row.source === "move_in"
                ? t("owner.meter.moveInBaseline")
                : row.billing_month}
            </p>
            <p className="mt-1 text-zinc-600">
              {t("owner.meter.water")}:{" "}
              {row.water_prev != null && row.water_curr != null
                ? `${formatMeterNumber(row.water_prev)} → ${formatMeterNumber(row.water_curr)}`
                : row.water_curr != null
                  ? formatMeterNumber(row.water_curr)
                  : "-"}
              {row.water_units != null &&
                ` (${formatMeterNumber(row.water_units)} ${t("owner.meter.unitLabel")})`}
            </p>
            <p className="text-zinc-600">
              {t("owner.meter.electric")}:{" "}
              {row.electric_prev != null && row.electric_curr != null
                ? `${formatMeterNumber(row.electric_prev)} → ${formatMeterNumber(row.electric_curr)}`
                : row.electric_curr != null
                  ? formatMeterNumber(row.electric_curr)
                  : "-"}
              {row.electric_units != null &&
                ` (${formatMeterNumber(row.electric_units)} ${t("owner.meter.unitLabel")})`}
            </p>
            {row.recorded_at && (
              <p className="mt-1 text-zinc-500">
                {t("owner.meter.recordedAt", {
                  date: formatMeterDate(row.recorded_at, locale),
                })}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
