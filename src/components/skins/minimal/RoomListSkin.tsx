"use client";

import { useEffect, useState } from "react";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
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
  canAddRoom?: boolean;
  roomsRemaining?: number;
  billingHref?: string;
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
  canAddRoom = true,
  roomsRemaining,
  billingHref,
}: RoomListSkinProps) {
  const { t } = useLocale();
  const [showAddForm, setShowAddForm] = useState(false);
  const showMeterHint =
    includeUtilities && editableCount > 0 && readyCount === 0;

  useEffect(() => {
    setShowAddForm(false);
  }, [rows.length]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
          {t("owner.rooms.listTitle")}
        </h2>
        <p className="mt-1 text-zinc-500">
          {includeUtilities
            ? t("owner.billing.rates", {
                month: billingMonth,
                water: waterRate,
                electric: electricRate,
              })
            : t("owner.billing.rentOnly")}
          {" · "}
          {t("owner.billing.cycleDay", { day: billingDay })}
        </p>
        <a
          href={`/settings?property=${encodeURIComponent(propertySlug)}#billing`}
          className="mt-1 inline-block text-green-700 underline"
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
          variant="first"
          onSubmit={onAddRoom}
        />
      )}

      {rows.length === 0 && !onAddRoom && (
        <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center text-zinc-600">
          {t("owner.billing.noRooms")}
        </p>
      )}

      {rows.length > 0 && (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.tenant_id}>
              <button
                type="button"
                onClick={() => onSelect(row.tenant_id)}
                className="w-full rounded-xl border border-zinc-100 bg-white px-4 py-4 text-left hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-zinc-900">{row.tenant_name}</p>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-1 font-medium ${statusTone(row.invoice_status)}`}
                  >
                    {row.invoice_status
                      ? t(statusMessageKey(row.invoice_status))
                      : t("status.noBill")}
                  </span>
                </div>
                <p className="mt-2 font-bold text-zinc-900">
                  {t("common.room", { number: row.room_number })}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 && onAddRoom && canAddRoom && !showAddForm && (
        <button
          type="button"
          disabled={disabled || addRoomSaving}
          onClick={() => setShowAddForm(true)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-3 font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + {t("owner.rooms.addRoom")}
          {roomsRemaining !== undefined && roomsRemaining > 0 && (
            <span className="ml-1 font-normal text-zinc-500">
              ({t("owner.rooms.quotaHint", { remaining: roomsRemaining })})
            </span>
          )}
        </button>
      )}

      {rows.length > 0 && onAddRoom && canAddRoom && showAddForm && (
        <EmptyProjectOnboardingSkin
          propertySlug={propertySlug}
          disabled={disabled}
          saving={addRoomSaving}
          error={addRoomError}
          variant="additional"
          formKey={String(rows.length)}
          onCancel={() => setShowAddForm(false)}
          onSubmit={onAddRoom}
        />
      )}

      {rows.length > 0 && !canAddRoom && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          {t("owner.plan.limitReached")}
          {billingHref && (
            <>
              {" "}
              <a href={billingHref} className="font-medium underline">
                {t("owner.planBilling.managePlan")}
              </a>
            </>
          )}
        </p>
      )}

      {showMeterHint && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          {t("owner.billing.meterRequired")}
        </p>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          disabled={disabled || readyCount === 0}
          onClick={onSubmit}
          className="flex w-full items-center justify-center rounded-lg bg-zinc-900 py-3 font-medium text-white disabled:opacity-50"
        >
          <EasyModeCtaIcon name="bill" />
          {t("owner.billing.submit", { count: readyCount })}
        </button>
      )}

      {result && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
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
