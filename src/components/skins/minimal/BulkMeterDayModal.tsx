"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { MeterReadCard } from "@/components/skins/minimal/MeterReadCard";
import type { MeterUtilityType } from "@/services/meterPhotoService";
import type { RoomListRow } from "@/components/skins/minimal/RoomListSkin";

interface BulkMeterDayModalProps {
  rows: RoomListRow[];
  billingMonth: string;
  includeUtilities: boolean;
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-zinc-200 bg-white p-4 shadow-lg sm:rounded-xl">
        <p className="text-xs text-zinc-500">
          {t("owner.bulkMeter.progress", { current: index + 1, total: rows.length })}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-900">
          {row.tenant_name} · {t("common.room", { number: row.room_number })}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{billingMonth}</p>

        {includeUtilities && (
          <div className="mt-4 space-y-3">
            <MeterReadCard
              kind="water"
              prev={row.water_prev}
              currValue={meter.water}
              rate={waterRate}
              disabled={disabled}
              onCurrChange={(value) =>
                onMeterChange(row.tenant_id, value, meter.electric)
              }
              photoSlot={
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => waterRef.current?.click()}
                  className="min-h-11 w-full rounded-md border border-zinc-200 text-xs font-medium disabled:opacity-50"
                >
                  {t("owner.meterPhoto.capture")}
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
            <MeterReadCard
              kind="electric"
              prev={row.electric_prev}
              currValue={meter.electric}
              rate={electricRate}
              disabled={disabled}
              onCurrChange={(value) =>
                onMeterChange(row.tenant_id, meter.water, value)
              }
              photoSlot={
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => electricRef.current?.click()}
                  className="min-h-11 w-full rounded-md border border-zinc-200 text-xs font-medium disabled:opacity-50"
                >
                  {t("owner.meterPhoto.capture")}
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

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-md border border-zinc-200 text-sm"
          >
            {t("owner.rooms.close")}
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
            className="min-h-11 flex-1 rounded-md bg-green-700 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLast ? t("owner.bulkMeter.done") : t("owner.bulkMeter.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
