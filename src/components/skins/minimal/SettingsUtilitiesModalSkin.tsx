"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import type { WaterBillingMode } from "@/services/propertyBillingSettingsService";
import type { PropertyPaymentInput } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface SettingsUtilitiesModalSkinProps {
  includeUtilities: boolean;
  waterBillingMode: WaterBillingMode;
  waterFlatBaht: number;
  waterRate: number;
  electricRate: number;
  saving: boolean;
  onClose: () => void;
  onSave: (input: Pick<
    PropertyPaymentInput,
    | "include_utilities"
    | "water_billing_mode"
    | "water_flat_baht"
    | "water_rate_per_unit"
    | "electric_rate_per_unit"
  >) => Promise<boolean>;
}

export function SettingsUtilitiesModalSkin({
  includeUtilities: initialIncludeUtilities,
  waterBillingMode: initialWaterBillingMode,
  waterFlatBaht: initialWaterFlatBaht,
  waterRate: initialWaterRate,
  electricRate: initialElectricRate,
  saving,
  onClose,
  onSave,
}: SettingsUtilitiesModalSkinProps) {
  const { t } = useLocale();
  const [includeUtilities, setIncludeUtilities] = useState(initialIncludeUtilities);
  const [waterBillingMode, setWaterBillingMode] = useState<WaterBillingMode>(
    initialWaterBillingMode,
  );
  const [waterFlatBaht, setWaterFlatBaht] = useState(String(initialWaterFlatBaht));
  const [waterRate, setWaterRate] = useState(String(initialWaterRate));
  const [electricRate, setElectricRate] = useState(String(initialElectricRate));

  useEffect(() => {
    setIncludeUtilities(initialIncludeUtilities);
    setWaterBillingMode(initialWaterBillingMode);
    setWaterFlatBaht(String(initialWaterFlatBaht));
    setWaterRate(String(initialWaterRate));
    setElectricRate(String(initialElectricRate));
  }, [
    initialIncludeUtilities,
    initialWaterBillingMode,
    initialWaterFlatBaht,
    initialWaterRate,
    initialElectricRate,
  ]);

  const handleSave = () => {
    void onSave({
      include_utilities: includeUtilities,
      water_billing_mode: waterBillingMode,
      water_flat_baht: Number(waterFlatBaht),
      water_rate_per_unit: Number(waterRate),
      electric_rate_per_unit: Number(electricRate),
    }).then((ok) => {
      if (ok) onClose();
    });
  };

  return (
    <SettingsSectionModalShell
      title={t("settings.row.utilities")}
      subtitle={t("settings.utilitiesDesc")}
      onClose={onClose}
      saving={saving}
      onSave={handleSave}
    >
      <div className="space-y-4">
        <label className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 text-base">
          <span className="font-medium text-zinc-900">{t("settings.includeUtilities")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={includeUtilities}
            onClick={() => setIncludeUtilities((prev) => !prev)}
            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full px-1 transition ${
              includeUtilities ? "bg-rc-green" : "bg-zinc-300"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white transition ${
                includeUtilities ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </label>
        <p className="text-sm text-zinc-500">
          {includeUtilities
            ? t("settings.includeUtilitiesOn")
            : t("settings.includeUtilitiesOff")}
        </p>

        {includeUtilities && (
          <div className="space-y-3">
            <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-900">
                {t("settings.waterBillingMode")}
              </p>
              <div className="flex gap-2">
                {(["flat", "meter"] as const).map((mode) => {
                  const active = waterBillingMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWaterBillingMode(mode)}
                      className={`min-h-12 flex-1 rounded-lg border px-3 text-sm font-medium ${
                        active
                          ? "border-rc-green bg-rc-green text-white"
                          : "border-zinc-200 bg-white text-zinc-700"
                      }`}
                    >
                      {mode === "flat"
                        ? t("settings.waterBillingFlat")
                        : t("settings.waterBillingMeter")}
                    </button>
                  );
                })}
              </div>
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">
                  {waterBillingMode === "flat"
                    ? t("settings.waterFlatBaht")
                    : t("settings.waterRate")}
                </span>
                <input
                  type="number"
                  min={0}
                  max={waterBillingMode === "flat" ? 99999 : 999}
                  step={waterBillingMode === "flat" ? 1 : 0.01}
                  inputMode="decimal"
                  value={waterBillingMode === "flat" ? waterFlatBaht : waterRate}
                  onChange={(event) =>
                    waterBillingMode === "flat"
                      ? setWaterFlatBaht(event.target.value)
                      : setWaterRate(event.target.value)
                  }
                  className={inputClass}
                />
              </label>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">
                  {t("settings.electricRate")}
                </span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  step={0.01}
                  inputMode="decimal"
                  value={electricRate}
                  onChange={(event) => setElectricRate(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </SettingsSectionModalShell>
  );
}
