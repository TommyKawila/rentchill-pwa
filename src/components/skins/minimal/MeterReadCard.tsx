"use client";

import { useLocale } from "@/components/LocaleProvider";
import { calculateMeterUnits } from "@/services/invoiceCalculator";
import {
  formatMeterDate,
  formatMeterNumber,
} from "@/services/meterFormat";
import type { MeterDialSnapshot } from "@/services/meterReadingService";

interface MeterReadCardProps {
  kind: "water" | "electric";
  prev: MeterDialSnapshot | null;
  currValue: string;
  rate: number;
  disabled?: boolean;
  onCurrChange: (value: string) => void;
  photoSlot?: React.ReactNode;
}

export function MeterReadCard({
  kind,
  prev,
  currValue,
  rate,
  disabled,
  onCurrChange,
  photoSlot,
}: MeterReadCardProps) {
  const { t, locale } = useLocale();
  const label =
    kind === "water" ? t("owner.meter.water") : t("owner.meter.electric");

  const currNum = currValue.trim() === "" ? null : Number(currValue);
  let units: number | null = null;
  let amount: number | null = null;
  let rolledBack = false;

  if (prev && currNum !== null && Number.isFinite(currNum)) {
    try {
      units = calculateMeterUnits(prev.value, currNum);
      amount = units * rate;
    } catch {
      rolledBack = true;
    }
  }

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-base font-semibold text-zinc-900">{label}</p>

      <div className="mt-2 space-y-1 text-sm text-zinc-600">
        <p>
          {t("owner.meter.prev")}{" "}
          <span className="font-bold text-zinc-900">
            {prev ? formatMeterNumber(prev.value) : t("owner.meter.noBaseline")}
          </span>
          {prev && (
            <span className="text-zinc-500">
              {" "}
              · {formatMeterDate(prev.recorded_at, locale)}
            </span>
          )}
        </p>
      </div>

      <label className="mt-3 block space-y-1 text-sm text-zinc-500">
        <span className="font-medium text-zinc-900">{t("owner.meter.curr")}</span>
        <input
          type="number"
          min={0}
          inputMode="decimal"
          disabled={disabled || !prev}
          value={currValue}
          onChange={(e) => onCurrChange(e.target.value)}
          placeholder={t("owner.meter.currPlaceholder")}
          className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base disabled:bg-zinc-100"
        />
      </label>

      {rolledBack && (
        <p className="mt-2 text-sm text-red-600">{t("owner.meter.rolledBack")}</p>
      )}

      {units !== null && amount !== null && !rolledBack && (
        <div className="mt-2 space-y-0.5 text-sm text-zinc-600">
          <p>
            {t("owner.meter.units", { units: formatMeterNumber(units) })}
          </p>
          <p>
            {t("owner.meter.cost", {
              amount: amount.toLocaleString("th-TH"),
              rate: rate.toLocaleString("th-TH"),
            })}
          </p>
        </div>
      )}

      {photoSlot && <div className="mt-3">{photoSlot}</div>}
    </div>
  );
}
