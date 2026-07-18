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

interface DashboardSearchChipsSkinProps {
  query: string;
  filter: DashboardQuickFilter | null;
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
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("owner.rooms.searchPlaceholder")}
          className="h-11 w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-rc-text shadow-sm placeholder:text-zinc-400"
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
              className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors active:scale-[0.98] ${
                active
                  ? "border-rc-green bg-rc-green text-white"
                  : "border-zinc-200 bg-white text-zinc-500"
              }`}
            >
              <span className="whitespace-nowrap">{t(FILTER_LABEL_KEYS[key])}</span>
              <span
                className={`inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums leading-none ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-rc-bg text-zinc-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
