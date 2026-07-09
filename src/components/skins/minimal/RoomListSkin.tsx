"use client";

import { EmptyProjectOnboardingSkin } from "@/components/skins/minimal/EmptyProjectOnboardingSkin";
import { useLocale } from "@/components/LocaleProvider";
import type { AddRoomTenantForm } from "@/hooks/useAddRoomTenant";
import { statusMessageKey } from "@/services/i18n/translate";
import type { InvoiceStatus } from "@/services/types";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

export type RoomListRow = MonthlyBillingRow & {
  no: number;
};

interface RoomListSkinProps {
  propertySlug: string;
  billingMonth: string;
  billingDay: number;
  includeUtilities: boolean;
  waterRate: number;
  electricRate: number;
  rows: RoomListRow[];
  disabled?: boolean;
  editableCount: number;
  readyCount: number;
  result?: {
    created: number;
    updated: number;
    skipped: number;
  } | null;
  onSelect: (tenantId: string) => void;
  onSubmit: () => void;
  onAddRoom?: (form: AddRoomTenantForm) => void;
  addRoomSaving?: boolean;
  addRoomError?: string | null;
}

function statusTone(status: InvoiceStatus | null) {
  if (status === "paid") return "bg-green-50 text-green-800";
  if (status === "scanning") return "bg-orange-50 text-orange-800";
  if (status === "pending") return "bg-amber-50 text-amber-800";
  return "bg-zinc-100 text-zinc-600";
}

export function RoomListSkin({
  propertySlug,
  billingMonth,
  billingDay,
  includeUtilities,
  waterRate,
  electricRate,
  rows,
  disabled,
  editableCount,
  readyCount,
  result,
  onSelect,
  onSubmit,
  onAddRoom,
  addRoomSaving,
  addRoomError,
}: RoomListSkinProps) {
  const { t } = useLocale();
  const showMeterHint =
    includeUtilities && editableCount > 0 && readyCount === 0;

  return (
    <section className="mt-8 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-zinc-800">
          {t("owner.rooms.listTitle")}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {includeUtilities
            ? t("owner.billing.rates", {
                month: billingMonth,
                water: waterRate,
                electric: electricRate,
              })
            : t("owner.billing.rentOnly")}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {t("owner.billing.cycleDay", { day: billingDay })}
        </p>
        <a
          href={`/settings?property=${encodeURIComponent(propertySlug)}#billing`}
          className="mt-1 inline-block text-xs text-green-700 underline"
        >
          {t("owner.billing.editCycle")}
        </a>
      </div>

      {rows.length === 0 && onAddRoom && (
        <EmptyProjectOnboardingSkin
          propertySlug={propertySlug}
          disabled={disabled}
          saving={addRoomSaving}
          error={addRoomError}
          onSubmit={onAddRoom}
        />
      )}

      {rows.length === 0 && !onAddRoom && (
        <p className="text-sm text-zinc-600">{t("owner.billing.noRooms")}</p>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="grid grid-cols-[2rem_1fr_3rem_5.5rem_1.25rem] gap-2 border-b border-zinc-100 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            <span>{t("owner.rooms.colNo")}</span>
            <span>{t("owner.rooms.colName")}</span>
            <span>{t("owner.rooms.colRoom")}</span>
            <span>{t("owner.rooms.colStatus")}</span>
            <span />
          </div>

          <ul className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <li key={row.tenant_id}>
                <button
                  type="button"
                  onClick={() => onSelect(row.tenant_id)}
                  className="grid w-full grid-cols-[2rem_1fr_3rem_5.5rem_1.25rem] items-center gap-2 px-3 py-2.5 text-left hover:bg-zinc-50"
                >
                  <span className="text-xs text-zinc-400">{row.no}</span>
                  <span className="truncate text-sm font-medium text-zinc-900">
                    {row.tenant_name}
                  </span>
                  <span className="text-sm text-zinc-600">{row.room_number}</span>
                  <span
                    className={`truncate rounded px-1.5 py-0.5 text-center text-[11px] font-medium ${statusTone(row.invoice_status)}`}
                  >
                    {row.invoice_status
                      ? t(statusMessageKey(row.invoice_status))
                      : t("status.noBill")}
                  </span>
                  <span className="text-zinc-300">›</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showMeterHint && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t("owner.billing.meterRequired")}
        </p>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          disabled={disabled || readyCount === 0}
          onClick={onSubmit}
          className="w-full rounded-md bg-green-700 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("owner.billing.submit", { count: readyCount })}
        </button>
      )}

      {result && (
        <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {t("owner.billing.result", {
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
          })}
        </p>
      )}
    </section>
  );
}
