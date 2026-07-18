"use client";

import { DashboardRoomCardSkin } from "@/components/skins/minimal/DashboardRoomCardSkin";
import { DashboardRoomCardSkeletonSkin } from "@/components/skins/minimal/DashboardRoomCardSkeletonSkin";
import { DashboardSearchChipsSkin } from "@/components/skins/minimal/DashboardSearchChipsSkin";
import { AddRoomButton } from "@/components/rooms/AddRoomButton";
import { useLocale } from "@/components/LocaleProvider";
import { useDashboardRoomListView } from "@/hooks/useDashboardRoomListView";
import type { AddRoomForm } from "@/hooks/useAddRoomTenant";
import type { VacantRoomRow } from "@/services/vacantRoomService";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { ReminderDaySettings } from "@/services/paymentReminderTier";
import { getRoomReminderCardMeta } from "@/services/roomReminderCardService";

export type RoomListRow = MonthlyBillingRow & {
  no: number;
};

interface RoomListSkinProps {
  propertySlug: string;
  propertyName: string;
  coverUrl?: string | null;
  billingDay: number;
  reminderSettings: ReminderDaySettings;
  includeUtilities: boolean;
  rows: RoomListRow[];
  vacantRooms: VacantRoomRow[];
  meters: Record<string, { water: string; electric: string }>;
  listHash?: string;
  filterBanner?: string | null;
  onClearListHash?: () => void;
  disabled?: boolean;
  onSelect: (tenantId: string) => void;
  onSelectVacant?: (room: VacantRoomRow) => void;
  onAddRoom?: (form: AddRoomForm) => void;
  addRoomSaving?: boolean;
  addRoomError?: string | null;
  roomsLoading?: boolean;
  slipEvaluating?: boolean;
}

export function RoomListSkin({
  propertySlug,
  propertyName,
  coverUrl,
  billingDay,
  reminderSettings,
  includeUtilities,
  rows,
  vacantRooms,
  meters,
  listHash,
  filterBanner,
  onClearListHash,
  disabled,
  onSelect,
  onSelectVacant,
  onAddRoom,
  addRoomSaving,
  addRoomError,
  roomsLoading,
  slipEvaluating,
}: RoomListSkinProps) {
  const { t } = useLocale();
  const listView = useDashboardRoomListView(
    rows,
    vacantRooms,
    { meters, includeUtilities },
    propertyName,
    listHash,
  );

  const showList = rows.length > 0 || vacantRooms.length > 0;
  const isVacantView = listView.filter === "vacant" && !listHash;

  return (
    <section id="owner-rooms" className="space-y-4">
      {filterBanner && listHash && onClearListHash && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rc-green/30 bg-rc-green-soft px-4 py-3">
          <p className="text-sm font-medium text-rc-green-ink">{filterBanner}</p>
          <button
            type="button"
            onClick={onClearListHash}
            className="shrink-0 text-sm font-medium text-rc-green-ink underline underline-offset-2"
          >
            {t("owner.rooms.clearFilters")}
          </button>
        </div>
      )}

      {rows.length === 0 && onAddRoom && (
        <AddRoomButton
          propertySlug={propertySlug}
          variant="first"
          disabled={disabled}
          saving={addRoomSaving}
          error={addRoomError}
          onSubmit={onAddRoom}
        />
      )}

      {rows.length === 0 && !onAddRoom && vacantRooms.length === 0 && (
        <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center text-zinc-600">
          {t("owner.billing.noRooms")}
        </p>
      )}

      {showList && (
        <DashboardSearchChipsSkin
          query={listView.query}
          filter={listView.chipFilter}
          counts={listView.counts}
          onQueryChange={(value) => {
            onClearListHash?.();
            listView.setQuery(value);
          }}
          onFilterChange={(value) => {
            onClearListHash?.();
            listView.setFilter(value);
          }}
        />
      )}

      {showList && listView.totalFiltered === 0 && (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <p className="text-zinc-600">{t("owner.rooms.noMatch")}</p>
          <button
            type="button"
            onClick={() => {
              onClearListHash?.();
              listView.clearFilters();
            }}
            className="mt-3 min-h-12 rounded-lg border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-700"
          >
            {t("owner.rooms.clearFilters")}
          </button>
        </div>
      )}

      {!isVacantView && roomsLoading && listView.visibleRows.length === 0 && (
        <ul className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <DashboardRoomCardSkeletonSkin />
            </li>
          ))}
        </ul>
      )}

      {!isVacantView && listView.visibleRows.length > 0 && (
        <ul className="space-y-3">
          {listView.visibleRows.map((row) => (
            <li key={row.tenant_id}>
              <DashboardRoomCardSkin
                propertyName={propertyName}
                roomNumber={row.room_number}
                tenantName={row.tenant_name}
                billingDay={billingDay}
                coverUrl={coverUrl}
                invoiceStatus={row.invoice_status}
                slipRejectionNote={row.slip_rejection_note}
                slipSubmittedAt={row.slip_submitted_at}
                slipEvaluating={slipEvaluating && row.invoice_status === "scanning"}
                reminderMeta={getRoomReminderCardMeta(row, reminderSettings)}
                onClick={() => onSelect(row.tenant_id)}
              />
            </li>
          ))}
        </ul>
      )}

      {isVacantView && listView.visibleVacant.length > 0 && (
        <ul className="space-y-3">
          {listView.visibleVacant.map((room) => (
            <li key={room.room_id}>
              <DashboardRoomCardSkin
                propertyName={propertyName}
                roomNumber={room.room_number}
                billingDay={billingDay}
                coverUrl={coverUrl}
                invoiceStatus={null}
                vacant
                onClick={onSelectVacant ? () => onSelectVacant(room) : undefined}
              />
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

      {rows.length > 0 && onAddRoom && (
        <AddRoomButton
          propertySlug={propertySlug}
          variant="additional"
          disabled={disabled}
          saving={addRoomSaving}
          error={addRoomError}
          formKey={String(rows.length)}
          onSubmit={onAddRoom}
        />
      )}
    </section>
  );
}
