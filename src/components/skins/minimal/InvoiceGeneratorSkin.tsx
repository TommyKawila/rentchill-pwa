"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { InvoiceExpenseFieldsSkin } from "@/components/skins/minimal/InvoiceExpenseFieldsSkin";
import { InvoiceIssueFooterSkin } from "@/components/skins/minimal/InvoiceIssueFooterSkin";
import { InvoiceIssueHeaderSkin } from "@/components/skins/minimal/InvoiceIssueHeaderSkin";
import { InvoicePeriodSelectorSkin } from "@/components/skins/minimal/InvoicePeriodSelectorSkin";
import { InvoiceSummaryCardSkin } from "@/components/skins/minimal/InvoiceSummaryCardSkin";
import { useBillingMonthDisplayFormat } from "@/hooks/useBillingMonthDisplayFormat";
import {
  computeIssueAmounts,
  getCurrentBillingMonth,
  totalWithExtras,
} from "@/services/invoiceCalculator";
import { isRowReadyToBill } from "@/services/propertyBillingSettingsService";
import { canSendBillViaLineOa } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { InvoiceExtraItem, PropertyPaymentAccount } from "@/services/types";
import type { RoomDetailSavingAction } from "@/components/skins/minimal/RoomDetailBillingFooterSkin";
import type { MeterPhotoRow } from "@/services/meterPhotoService";

export type InvoiceGeneratorIssueInput = {
  billingMonth: string;
  extraItems: InvoiceExtraItem[];
  includePromptPayQr: boolean;
  waterFlatBaht: number;
};

interface InvoiceGeneratorSkinProps {
  row: MonthlyBillingRow;
  propertyName: string;
  coverUrl?: string | null;
  billingMonth: string;
  includeUtilities: boolean;
  waterRate: number;
  electricRate: number;
  meters: { water: string; electric: string };
  onMeterChange: (water: string, electric: string) => void;
  paymentAccount: PropertyPaymentAccount | null;
  planTier: PlanTier;
  meterPhotos: MeterPhotoRow[];
  meterPhotosUploading: boolean;
  meterPhotosError: string | null;
  onMeterPhotoUpload: (kind: "water" | "electric", file: File) => void;
  needsBaseline: boolean;
  meterLocked: boolean;
  meterBaselineSaving: boolean;
  meterBaselineError: string | null;
  onSaveBaseline: (water: number, electric: number) => void;
  savingAction?: RoomDetailSavingAction;
  disabled?: boolean;
  hasNextRoom?: boolean;
  readyCount?: number;
  onBack: () => void;
  onSaveAndNext?: () => void;
  onSaveAndSend: (input: InvoiceGeneratorIssueInput) => void;
  onCopyText: (input: InvoiceGeneratorIssueInput) => void;
}

function billingMonthOptions(current: string) {
  const base = current || getCurrentBillingMonth();
  const [year, month] = base.split("-").map(Number);
  const options: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(year, month - 1 - i, 1);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    options.push(`${d.getFullYear()}-${m}`);
  }
  return options;
}

export function InvoiceGeneratorSkin({
  row,
  propertyName,
  coverUrl,
  billingMonth,
  includeUtilities,
  electricRate,
  meters,
  onMeterChange,
  paymentAccount,
  planTier,
  meterPhotos,
  meterPhotosUploading,
  meterPhotosError,
  onMeterPhotoUpload,
  needsBaseline,
  meterLocked,
  meterBaselineSaving,
  meterBaselineError,
  onSaveBaseline,
  savingAction = null,
  disabled,
  hasNextRoom = false,
  readyCount = 0,
  onBack,
  onSaveAndNext,
  onSaveAndSend,
  onCopyText,
}: InvoiceGeneratorSkinProps) {
  const { t } = useLocale();
  const { formatMonth } = useBillingMonthDisplayFormat();
  const [selectedMonth, setSelectedMonth] = useState(billingMonth);
  const [waterFlatBaht, setWaterFlatBaht] = useState("0");
  const [extraItems, setExtraItems] = useState<InvoiceExtraItem[]>([]);
  const [includePromptPayQr, setIncludePromptPayQr] = useState(true);

  const monthOptions = useMemo(() => {
    return billingMonthOptions(billingMonth).map((month) => ({
      value: month,
      label: formatMonth(month),
    }));
  }, [billingMonth, formatMonth]);

  const waterFlatNum = Number(waterFlatBaht) || 0;

  const issueInput: InvoiceGeneratorIssueInput = {
    billingMonth: selectedMonth,
    extraItems: extraItems.filter(
      (item) => item.label.trim() && Number.isFinite(item.amount) && item.amount > 0,
    ),
    includePromptPayQr,
    waterFlatBaht: waterFlatNum,
  };

  let electricAmount = 0;
  let electricUnits: number | null = null;

  if (
    includeUtilities &&
    row.electric_prev &&
    meters.electric.trim() !== ""
  ) {
    try {
      const computed = computeIssueAmounts({
        baseRent: row.base_rent_price,
        waterFlatBaht: waterFlatNum,
        electricPrev: row.electric_prev.value,
        electricCurr: Number(meters.electric),
        electricRate,
      });
      electricAmount = computed.electric_amount;
      electricUnits = computed.electric_unit;
    } catch {
      /* invalid electric reading */
    }
  }

  const waterAmount = includeUtilities ? waterFlatNum : 0;
  const baseTotal = row.base_rent_price + waterAmount + electricAmount;
  const grandTotal = totalWithExtras(baseTotal, issueInput.extraItems);
  const busy = savingAction !== null;
  const canAct = isRowReadyToBill(row, meters, includeUtilities, {
    waterFlatBaht: waterFlatNum,
  }) && !disabled && !busy;
  const promptPay = paymentAccount?.prompt_pay ?? null;

  const addExtraRow = () => {
    setExtraItems((prev) => [...prev, { label: "", amount: 0 }]);
  };

  const updateExtra = (index: number, patch: Partial<InvoiceExtraItem>) => {
    setExtraItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const removeExtra = (index: number) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="space-y-4 pb-32">
        <InvoiceIssueHeaderSkin
          propertyName={propertyName}
          roomNumber={row.room_number}
          tenantName={row.tenant_name}
          coverUrl={coverUrl}
          onBack={onBack}
        />

        <InvoicePeriodSelectorSkin
          value={selectedMonth}
          options={monthOptions}
          disabled={disabled || busy}
          onChange={setSelectedMonth}
        />

        <InvoiceExpenseFieldsSkin
          baseRent={row.base_rent_price}
          includeUtilities={includeUtilities}
          waterFlatBaht={waterFlatBaht}
          electricPrev={row.electric_prev}
          electricValue={meters.electric}
          electricRate={electricRate}
          electricUnits={electricUnits}
          electricAmount={electricAmount}
          disabled={disabled || busy}
          onWaterFlatChange={setWaterFlatBaht}
          onElectricChange={(value) => onMeterChange(meters.water, value)}
          extraItems={extraItems}
          onExtraChange={updateExtra}
          onExtraRemove={removeExtra}
          onExtraAdd={addExtraRow}
          needsBaseline={needsBaseline}
          meterLocked={meterLocked}
          meterBaselineSaving={meterBaselineSaving}
          meterBaselineError={meterBaselineError}
          onSaveBaseline={onSaveBaseline}
          planTier={planTier}
          meterPhotos={meterPhotos}
          meterPhotosUploading={meterPhotosUploading}
          meterPhotosError={meterPhotosError}
          onMeterPhotoUpload={onMeterPhotoUpload}
        />

        <InvoiceSummaryCardSkin
          grandTotal={grandTotal}
          showQrToggle={Boolean(promptPay)}
          includePromptPayQr={includePromptPayQr}
          disabled={disabled || busy}
          onQrToggle={setIncludePromptPayQr}
        />

        <div className="space-y-3">
          {!canAct && includeUtilities && (
            <p className="text-sm text-red-600">{t("owner.billing.meterRequired")}</p>
          )}

          <button
            type="button"
            disabled={!canAct}
            onClick={() => onCopyText(issueInput)}
            className="min-h-10 w-full text-sm font-medium text-rc-primary underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.invoiceGen.copyText")}
          </button>

          {includeUtilities && onSaveAndNext && (
            <button
              type="button"
              disabled={!canAct}
              onClick={onSaveAndNext}
              className="flex min-h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAction === "save"
                ? t("common.saving")
                : hasNextRoom
                  ? t("owner.roomDetail.saveAndNext")
                  : t("owner.roomDetail.saveAndClose")}
            </button>
          )}

          {canAct && readyCount > 1 && (
            <p className="text-sm text-zinc-500">
              {t("owner.roomDetail.bulkHint", { count: readyCount })}
            </p>
          )}
        </div>
      </div>

      <InvoiceIssueFooterSkin
        disabled={!canAct}
        busy={busy}
        lineOaEnabled={canSendBillViaLineOa(planTier)}
        onSaveAndSend={() => onSaveAndSend(issueInput)}
      />
    </>
  );
}

export function buildGeneratorBillPayload(
  row: MonthlyBillingRow,
  input: InvoiceGeneratorIssueInput,
  meters: { water: string; electric: string },
  includeUtilities: boolean,
  waterRate: number,
  electricRate: number,
) {
  let baseRentAmount = row.base_rent_price;
  let waterAmount = input.waterFlatBaht;
  let electricAmount = 0;

  if (
    includeUtilities &&
    row.electric_prev &&
    meters.electric.trim() !== ""
  ) {
    try {
      const computed = computeIssueAmounts({
        baseRent: row.base_rent_price,
        waterFlatBaht: input.waterFlatBaht,
        electricPrev: row.electric_prev.value,
        electricCurr: Number(meters.electric),
        electricRate,
      });
      waterAmount = computed.water_amount;
      electricAmount = computed.electric_amount;
    } catch {
      /* keep defaults */
    }
  } else if (!includeUtilities) {
    waterAmount = 0;
  }

  const totalAmount = totalWithExtras(
    baseRentAmount + waterAmount + electricAmount,
    input.extraItems,
  );

  return {
    roomNumber: row.room_number,
    billingMonth: input.billingMonth,
    totalAmount,
    baseRentAmount,
    waterAmount,
    electricAmount,
    extraItems: input.extraItems,
  };
}
