"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface MeterBaselineFormSkinProps {
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  onSave: (water: number, electric: number) => void;
}

export function MeterBaselineFormSkin({
  disabled,
  saving,
  error,
  onSave,
}: MeterBaselineFormSkinProps) {
  const { t } = useLocale();
  const [water, setWater] = useState("");
  const [electric, setElectric] = useState("");

  const busy = disabled || saving;
  const waterNum = Number(water);
  const electricNum = Number(electric);
  const valid =
    water.trim() !== "" &&
    electric.trim() !== "" &&
    Number.isFinite(waterNum) &&
    Number.isFinite(electricNum) &&
    waterNum >= 0 &&
    electricNum >= 0;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
      <div>
        <p className="text-sm font-semibold text-amber-950">
          {t("owner.meter.baselineTitle")}
        </p>
        <p className="mt-1 text-xs text-amber-900">{t("owner.meter.baselineDesc")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-zinc-600">{t("owner.meter.water")}</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            disabled={busy}
            value={water}
            onChange={(e) => setWater(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 disabled:bg-zinc-100"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-zinc-600">{t("owner.meter.electric")}</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            disabled={busy}
            value={electric}
            onChange={(e) => setElectric(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 disabled:bg-zinc-100"
          />
        </label>
      </div>
      <button
        type="button"
        disabled={busy || !valid}
        onClick={() => onSave(waterNum, electricNum)}
        className="min-h-11 w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? t("common.saving") : t("owner.meter.baselineSave")}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
