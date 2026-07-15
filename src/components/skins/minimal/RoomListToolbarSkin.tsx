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
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t("owner.rooms.searchPlaceholder")}
        className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400"
      />

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-0.5">
        {ROOM_LIST_FILTERS.map((key) => {
          const active = filter === key;
          const count = counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              className={`inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
                active
                  ? "border-rc-green bg-rc-green text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {t(FILTER_LABEL_KEYS[key])}
              <span
                className={`tabular-nums ${
                  active ? "text-white/80" : "text-zinc-400"
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
