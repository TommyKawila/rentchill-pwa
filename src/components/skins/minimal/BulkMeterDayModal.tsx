"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { useBillingMonthDisplayFormat } from "@/hooks/useBillingMonthDisplayFormat";
import { MeterReadCard } from "@/components/skins/minimal/MeterReadCard";
import type { MeterUtilityType } from "@/services/meterPhotoService";
import {
  isFlatWaterBilling,
  type WaterBillingMode,
} from "@/services/propertyBillingSettingsService";
import type { RoomListRow } from "@/components/skins/minimal/RoomListSkin";

interface BulkMeterDayModalProps {
  rows: RoomListRow[];
  billingMonth: string;
  includeUtilities: boolean;
  waterBillingMode?: WaterBillingMode;
  waterRate: number;
  electricRate: number;
  meters: Record<string, { water: string; electric: string }>;
  disabled?: boolean;
  uploading?: boolean;
  onClose: () => void;
  onMeterChange: (tenantId: string, water: string, electric: string) => void;
  onUploadPhoto: (
    row: RoomListRow,
    utility: MeterUtilityType,
    file: File,
  ) => Promise<void>;
}

export function BulkMeterDayModal({
  rows,
  billingMonth,
  includeUtilities,
  waterBillingMode = "flat",
  waterRate,
  electricRate,
  meters,
  disabled,
  uploading,
  onClose,
  onMeterChange,
  onUploadPhoto,
}: BulkMeterDayModalProps) {
  const { t } = useLocale();
  const { formatMonth } = useBillingMonthDisplayFormat();
  const [index, setIndex] = useState(0);
  const waterRef = useRef<HTMLInputElement>(null);
  const electricRef = useRef<HTMLInputElement>(null);

  const row = rows[index];
  const meter = row
    ? (meters[row.tenant_id] ?? { water: "", electric: "" })
    : { water: "", electric: "" };
  const isLast = index >= rows.length - 1;

  if (!row) return null;

  const upload = async (utility: MeterUtilityType, file: File) => {
    await onUploadPhoto(row, utility, file);
  };

  const captureLabel = uploading ? t("common.saving") : t("owner.meterPhoto.capture");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-zinc-200 bg-white p-6 sm:rounded-xl">
        <p className="text-sm text-zinc-500">
          {t("owner.bulkMeter.progress", { current: index + 1, total: rows.length })}
        </p>
        <h2 className="mt-1 text-base font-semibold text-zinc-900">
          {row.tenant_name} · {t("common.room", { number: row.room_number })}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{formatMonth(billingMonth)}</p>

        {includeUtilities && (
          <div className="mt-4 space-y-3">
            {!isFlatWaterBilling(waterBillingMode) && (
              <>
            <MeterReadCard
              kind="water"
              prev={row.water_prev}
              currValue={meter.water}
              rate={waterRate}
              disabled={disabled || uploading}
              onCurrChange={(value) =>
                onMeterChange(row.tenant_id, value, meter.electric)
              }
              photoSlot={
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => waterRef.current?.click()}
                  className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-zinc-200 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {captureLabel}
                </button>
              }
            />
            <input
              ref={waterRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void upload("water", file);
              }}
            />
              </>
            )}
            <MeterReadCard
              kind="electric"
              prev={row.electric_prev}
              currValue={meter.electric}
              rate={electricRate}
              disabled={disabled || uploading}
              onCurrChange={(value) =>
                onMeterChange(row.tenant_id, meter.water, value)
              }
              photoSlot={
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => electricRef.current?.click()}
                  className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-zinc-200 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {captureLabel}
                </button>
              }
            />
            <input
              ref={electricRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void upload("electric", file);
              }}
            />
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-200 text-base text-zinc-700"
          >
            {t("owner.rooms.close")}
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg bg-rc-green-dark text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? t("common.saving")
              : isLast
                ? t("owner.bulkMeter.done")
                : t("owner.bulkMeter.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
