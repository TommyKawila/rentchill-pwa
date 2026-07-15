"use client";

import { useEffect, useState } from "react";
import { EmptyProjectOnboardingSkin } from "@/components/skins/minimal/EmptyProjectOnboardingSkin";
import { RoomListToolbarSkin } from "@/components/skins/minimal/RoomListToolbarSkin";
import { RoomReminderTimelineSkin } from "@/components/skins/minimal/RoomReminderTimelineSkin";
import { TenantPersonIcon } from "@/components/skins/minimal/TenantPersonIcon";
import { useLocale } from "@/components/LocaleProvider";
import { useRoomListView } from "@/hooks/useRoomListView";
import type { AddRoomTenantForm } from "@/hooks/useAddRoomTenant";
import { isPendingMeter, ROOM_LIST_TOOLBAR_MIN, type RoomListFilter } from "@/services/roomListFilterService";
import { statusMessageKey } from "@/services/i18n/translate";
import type { InvoiceStatus } from "@/services/types";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

export type RoomListRow = MonthlyBillingRow & {
  no: number;
};

interface RoomListSkinProps {
  propertySlug: string;
  billingDay: number;
  includeUtilities: boolean;
  rows: RoomListRow[];
  meters: Record<string, { water: string; electric: string }>;
  disabled?: boolean;
  onSelect: (tenantId: string) => void;
  onAddRoom?: (form: AddRoomTenantForm) => void;
  addRoomSaving?: boolean;
  addRoomError?: string | null;
  canAddRoom?: boolean;
  roomsRemaining?: number;
  billingHref?: string;
  urlFilter?: RoomListFilter | null;
  reminderSoftDays?: number;
  reminderFirmDays?: number;
  reminderFinalDays?: number;
}

function statusTone(status: InvoiceStatus | null) {
  if (status === "paid") return "bg-green-50 text-green-800";
  if (status === "scanning") return "bg-orange-50 text-orange-800";
  if (status === "pending") return "bg-amber-50 text-amber-800";
  return "bg-zinc-100 text-zinc-600";
}

export function RoomListSkin({
  propertySlug,
  billingDay,
  includeUtilities,
  rows,
  meters,
  disabled,
  onSelect,
  onAddRoom,
  addRoomSaving,
  addRoomError,
  canAddRoom = true,
  roomsRemaining,
  billingHref,
  urlFilter,
  reminderSoftDays = 3,
  reminderFirmDays = 7,
  reminderFinalDays = 10,
}: RoomListSkinProps) {
  const { t } = useLocale();
  const [showAddForm, setShowAddForm] = useState(false);
  const listView = useRoomListView(rows, { meters, includeUtilities }, urlFilter);
  const showToolbar = rows.length > ROOM_LIST_TOOLBAR_MIN;
  const reminderSettings = {
    soft: reminderSoftDays,
    firm: reminderFirmDays,
    final: reminderFinalDays,
  };

  useEffect(() => {
    setShowAddForm(false);
  }, [rows.length]);

  return (
    <section id="owner-rooms" className="space-y-4">
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-100">
          <div className="px-6 py-4">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              {t("owner.rooms.listTitle")}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {t("owner.billing.listBillingDay", { day: billingDay })}
              {" · "}
              <a
                href={`/settings?property=${encodeURIComponent(propertySlug)}#billing`}
                className="text-green-700 underline"
              >
                {t("owner.billing.editCycle")}
              </a>
            </p>
          </div>

          {showToolbar && (
            <RoomListToolbarSkin
              query={listView.query}
              filter={listView.filter}
              counts={listView.counts}
              visibleCount={listView.visibleRows.length}
              totalFiltered={listView.filteredRows.length}
              onQueryChange={listView.setQuery}
              onFilterChange={listView.setFilter}
            />
          )}

          {showToolbar && listView.filter === "unpaid" && (
            <div className="px-6 py-3">
              <p className="text-sm text-zinc-500">
                {t("owner.reminder.timeline.legend")}
              </p>
            </div>
          )}
        </div>
      )}

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

      {rows.length > 0 && listView.filteredRows.length === 0 && (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <p className="text-zinc-600">{t("owner.rooms.noMatch")}</p>
          <button
            type="button"
            onClick={listView.clearFilters}
            className="mt-3 min-h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-700"
          >
            {t("owner.rooms.clearFilters")}
          </button>
        </div>
      )}

      {listView.visibleRows.length > 0 && (
        <ul className="space-y-3">
          {listView.visibleRows.map((row) => (
            <li key={row.tenant_id}>
              <button
                type="button"
                onClick={() => onSelect(row.tenant_id)}
                className="w-full rounded-xl border border-zinc-100 bg-white px-4 py-4 text-left hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-bold tracking-tight text-zinc-900">
                      {t("common.room", { number: row.room_number })}
                    </p>
                    <div className="mt-1 flex items-center gap-x-2">
                      <TenantPersonIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                      <p className="truncate text-sm text-zinc-500">
                        {row.tenant_name.trim()}
                      </p>
                    </div>
                    {row.reminder_timeline && (
                      <RoomReminderTimelineSkin
                        timeline={row.reminder_timeline}
                        tierSent={row.reminder_tier_sent}
                        settings={reminderSettings}
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {includeUtilities &&
                      isPendingMeter(row, { meters, includeUtilities }) && (
                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-sm font-medium text-amber-900">
                          {t("owner.rooms.meterPendingBadge")}
                        </span>
                      )}
                    <span
                      className={`rounded-lg px-2 py-1 text-sm font-medium ${statusTone(row.invoice_status)}`}
                    >
                      {row.invoice_status
                        ? t(statusMessageKey(row.invoice_status))
                        : t("status.noBill")}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {listView.hasMore && (
        <button
          type="button"
          disabled={disabled}
          onClick={listView.loadMore}
          className="w-full min-h-12 rounded-lg border border-zinc-200 bg-white py-3 text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.rooms.loadMore", { remaining: listView.remaining })}
        </button>
      )}

      {rows.length > 0 && onAddRoom && canAddRoom && !showAddForm && (
        <button
          type="button"
          disabled={disabled || addRoomSaving}
          onClick={() => setShowAddForm(true)}
          className="w-full min-h-12 rounded-lg border border-zinc-200 bg-white py-3 text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </section>
  );
}
