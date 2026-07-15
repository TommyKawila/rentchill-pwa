"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import {
  ROOM_LIST_FILTERS,
  type RoomListFilter,
} from "@/services/roomListFilterService";

const FILTER_LABEL_KEYS: Record<RoomListFilter, MessageKey> = {
  all: "owner.rooms.filter.all",
  todo: "owner.rooms.filter.todo",
  notBilled: "owner.rooms.filter.notBilled",
  pendingMeter: "owner.rooms.filter.pendingMeter",
  unpaid: "owner.rooms.filter.unpaid",
  paid: "owner.rooms.filter.paid",
  scanning: "owner.rooms.filter.scanning",
};

interface RoomListToolbarSkinProps {
  query: string;
  filter: RoomListFilter;
  counts: Record<RoomListFilter, number>;
  visibleCount: number;
  totalFiltered: number;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: RoomListFilter) => void;
}

export function RoomListToolbarSkin({
  query,
  filter,
  counts,
  visibleCount,
  totalFiltered,
  onQueryChange,
  onFilterChange,
}: RoomListToolbarSkinProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3 px-6 py-4">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t("owner.rooms.searchPlaceholder")}
        className="min-h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400"
      />

      <div
        role="tablist"
        aria-label={t("owner.rooms.showing", {
          visible: Math.min(visibleCount, totalFiltered),
          total: totalFiltered,
        })}
        className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {ROOM_LIST_FILTERS.map((key) => {
          const active = filter === key;
          const count = counts[key];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(key)}
              className={`inline-flex min-h-12 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                active
                  ? "border-rc-green bg-rc-green text-white"
                  : "border-zinc-100 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {t(FILTER_LABEL_KEYS[key])}
              <span
                className={`font-bold tabular-nums ${
                  active ? "text-white" : "text-zinc-900"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-zinc-500">
        {t("owner.rooms.showing", {
          visible: Math.min(visibleCount, totalFiltered),
          total: totalFiltered,
        })}
      </p>
    </div>
  );
}
