"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface MeterBaselineFormSkinProps {
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  onSave: (water: number, electric: number) => void;
}

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base disabled:bg-zinc-100";

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
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div>
        <p className="text-base font-semibold text-amber-950">
          {t("owner.meter.baselineTitle")}
        </p>
        <p className="mt-1 text-sm text-amber-900">{t("owner.meter.baselineDesc")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("owner.meter.water")}</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            disabled={busy}
            value={water}
            onChange={(e) => setWater(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("owner.meter.electric")}</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            disabled={busy}
            value={electric}
            onChange={(e) => setElectric(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <button
        type="button"
        disabled={busy || !valid}
        onClick={() => onSave(waterNum, electricNum)}
        className="flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? t("common.saving") : t("owner.meter.baselineSave")}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
