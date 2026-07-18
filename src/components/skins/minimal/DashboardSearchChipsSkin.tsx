"use client";

import { Search } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import {
  DASHBOARD_QUICK_FILTERS,
  type DashboardQuickFilter,
} from "@/services/roomListFilterService";

const FILTER_LABEL_KEYS: Record<DashboardQuickFilter, MessageKey> = {
  all: "owner.rooms.filter.all",
  unpaid: "owner.rooms.filter.unpaidShort",
  scanning: "owner.rooms.filter.scanningShort",
  vacant: "owner.rooms.filter.vacant",
};

const INACTIVE_TONE: Record<DashboardQuickFilter, string> = {
  all: "text-zinc-700",
  unpaid: "text-rc-danger",
  scanning: "text-rc-warning",
  vacant: "text-zinc-500",
};

interface DashboardSearchChipsSkinProps {
  query: string;
  filter: DashboardQuickFilter;
  counts: Record<DashboardQuickFilter, number>;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: DashboardQuickFilter) => void;
}

export function DashboardSearchChipsSkin({
  query,
  filter,
  counts,
  onQueryChange,
  onFilterChange,
}: DashboardSearchChipsSkinProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("owner.rooms.searchPlaceholder")}
          className="h-11 w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-base text-rc-text placeholder:text-zinc-400"
        />
      </label>

      <div
        role="tablist"
        aria-label={t("owner.rooms.filter.ariaLabel")}
        className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {DASHBOARD_QUICK_FILTERS.map((key) => {
          const active = filter === key;
          const count = counts[key];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(key)}
              className={`inline-flex h-9 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                active
                  ? "border-rc-primary bg-rc-primary text-white"
                  : `border-zinc-100 bg-zinc-50 ${INACTIVE_TONE[key]} hover:bg-zinc-100`
              }`}
            >
              {t(FILTER_LABEL_KEYS[key])}
              <span
                className={`font-bold tabular-nums ${active ? "text-white" : ""}`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
