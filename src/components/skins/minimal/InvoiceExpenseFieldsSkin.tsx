"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { MeterBaselineFormSkin } from "@/components/skins/minimal/MeterBaselineFormSkin";
import { MeterPhotoVaultSkin } from "@/components/skins/minimal/MeterPhotoVaultSkin";
import { formatMeterNumber } from "@/services/meterFormat";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { InvoiceExtraItem } from "@/services/types";
import type { MeterPhotoRow } from "@/services/meterPhotoService";
import type { MeterDialSnapshot } from "@/services/meterReadingService";

interface InvoiceExpenseFieldsSkinProps {
  baseRent: number;
  includeUtilities: boolean;
  waterFlatBaht: string;
  electricPrev: MeterDialSnapshot | null;
  electricValue: string;
  electricRate: number;
  electricUnits: number | null;
  electricAmount: number;
  disabled?: boolean;
  onWaterFlatChange: (value: string) => void;
  onElectricChange: (value: string) => void;
  extraItems: InvoiceExtraItem[];
  onExtraChange: (index: number, patch: Partial<InvoiceExtraItem>) => void;
  onExtraRemove: (index: number) => void;
  onExtraAdd: () => void;
  needsBaseline?: boolean;
  meterLocked?: boolean;
  meterBaselineSaving?: boolean;
  meterBaselineError?: string | null;
  onSaveBaseline?: (water: number, electric: number) => void;
  planTier?: PlanTier;
  meterPhotos?: MeterPhotoRow[];
  meterPhotosUploading?: boolean;
  meterPhotosError?: string | null;
  onMeterPhotoUpload?: (kind: "water" | "electric", file: File) => void;
}

function AmountField({
  label,
  value,
  readOnly,
  disabled,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  suffix: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-rc-text">{label}</p>
      <div className="relative">
        <input
          type={readOnly ? "text" : "number"}
          min={0}
          inputMode="decimal"
          readOnly={readOnly}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`h-11 w-full rounded-lg border border-zinc-200 px-3 pr-14 text-right text-base tabular-nums ${
            readOnly ? "bg-zinc-100 text-zinc-600" : "bg-white text-rc-text"
          } disabled:bg-zinc-100`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function InvoiceExpenseFieldsSkin({
  baseRent,
  includeUtilities,
  waterFlatBaht,
  electricPrev,
  electricValue,
  electricRate,
  electricUnits,
  electricAmount,
  disabled,
  onWaterFlatChange,
  onElectricChange,
  extraItems,
  onExtraChange,
  onExtraRemove,
  onExtraAdd,
  needsBaseline,
  meterLocked,
  meterBaselineSaving,
  meterBaselineError,
  onSaveBaseline,
  planTier,
  meterPhotos,
  meterPhotosUploading,
  meterPhotosError,
  onMeterPhotoUpload,
}: InvoiceExpenseFieldsSkinProps) {
  const { t } = useLocale();
  const [meterExtrasOpen, setMeterExtrasOpen] = useState(false);

  return (
    <section className="space-y-4">
      <AmountField
        label={t("owner.invoiceGen.rentLabel")}
        value={baseRent.toLocaleString("th-TH")}
        readOnly
        suffix={t("owner.invoiceGen.unitBaht")}
      />

      {includeUtilities ? (
        <>
          {needsBaseline && !meterLocked && onSaveBaseline && (
            <MeterBaselineFormSkin
              saving={meterBaselineSaving}
              error={meterBaselineError}
              onSave={onSaveBaseline}
            />
          )}

          <AmountField
            label={t("owner.invoiceGen.waterLabel")}
            value={waterFlatBaht}
            disabled={disabled || meterLocked}
            onChange={onWaterFlatChange}
            suffix={t("owner.invoiceGen.unitBaht")}
          />

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-sm font-bold text-rc-text">
                  {t("owner.invoiceGen.electricPrev")}
                </p>
                <div className="flex h-11 items-center justify-end rounded-lg border border-zinc-200 bg-zinc-100 px-3 text-base tabular-nums text-zinc-600">
                  {electricPrev
                    ? formatMeterNumber(electricPrev.value)
                    : "—"}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-rc-text">
                  {t("owner.invoiceGen.electricCurr")}
                </p>
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  disabled={disabled || meterLocked || !electricPrev}
                  value={electricValue}
                  onChange={(e) => onElectricChange(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-right text-base tabular-nums text-rc-text disabled:bg-zinc-100"
                />
              </div>
            </div>
            {electricUnits !== null && (
              <p className="text-xs text-zinc-500">
                {t("owner.invoiceGen.formulaAuto", {
                  units: formatMeterNumber(electricUnits),
                  rate: electricRate.toLocaleString("th-TH"),
                  amount: electricAmount.toLocaleString("th-TH"),
                })}
              </p>
            )}
          </div>

          {planTier && onMeterPhotoUpload && (
            <div className="rounded-lg border border-zinc-100">
              <button
                type="button"
                onClick={() => setMeterExtrasOpen((v) => !v)}
                className="flex min-h-11 w-full items-center justify-between px-3 text-sm font-medium text-zinc-700"
              >
                {t("owner.invoiceGen.meterPhotos")}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${meterExtrasOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {meterExtrasOpen && (
                <div className="space-y-3 border-t border-zinc-100 px-3 py-3">
                  <MeterPhotoVaultSkin
                    planTier={planTier}
                    photos={(meterPhotos ?? []).filter((p) => p.utility_type === "electric")}
                    utilityOnly="electric"
                    compact
                    disabled={disabled || meterLocked}
                    uploading={meterPhotosUploading}
                    error={meterPhotosError}
                    onUpload={(_, file) => onMeterPhotoUpload("electric", file)}
                  />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-500">{t("owner.billing.rentOnly")}</p>
      )}

      <div className="space-y-2">
        {extraItems.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item.label}
              disabled={disabled}
              onChange={(e) => onExtraChange(index, { label: e.target.value })}
              placeholder={t("owner.invoiceGen.addonLabel")}
              className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-base"
            />
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={item.amount || ""}
              disabled={disabled}
              onChange={(e) =>
                onExtraChange(index, { amount: Number(e.target.value) || 0 })
              }
              className="h-11 w-24 rounded-lg border border-zinc-200 bg-white px-3 text-base"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => onExtraRemove(index)}
              className="h-11 shrink-0 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={onExtraAdd}
          className="h-11 w-full rounded-lg border border-dashed border-zinc-200 text-sm font-medium text-zinc-700"
        >
          {t("owner.invoiceGen.addItem")}
        </button>
      </div>
    </section>
  );
}
