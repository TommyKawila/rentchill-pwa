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

const INACTIVE_CHIP: Record<DashboardQuickFilter, string> = {
  all: "border-zinc-200/90 bg-white/95 text-zinc-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-zinc-300 hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)]",
  unpaid:
    "border-red-100/90 bg-white/95 text-rc-danger shadow-[0_1px_2px_rgba(239,68,68,0.06)] hover:border-red-200 hover:bg-red-50/30",
  scanning:
    "border-amber-100/90 bg-white/95 text-amber-800 shadow-[0_1px_2px_rgba(245,158,11,0.08)] hover:border-amber-200 hover:bg-amber-50/40",
  vacant:
    "border-zinc-200/90 bg-white/95 text-zinc-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-zinc-300 hover:bg-zinc-50/80",
};

const INACTIVE_BADGE: Record<DashboardQuickFilter, string> = {
  all: "bg-zinc-100 text-zinc-700",
  unpaid: "bg-red-50 text-rc-danger",
  scanning: "bg-amber-50 text-amber-800",
  vacant: "bg-zinc-100 text-zinc-600",
};

const STATUS_DOT: Record<DashboardQuickFilter, string> = {
  all: "bg-rc-green",
  unpaid: "bg-rc-danger",
  scanning: "bg-rc-warning",
  vacant: "bg-zinc-400",
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
              className={`inline-flex min-h-12 shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 text-sm font-medium backdrop-blur-sm transition-all duration-200 active:scale-[0.98] ${
                active
                  ? "border-transparent bg-gradient-to-br from-rc-green via-rc-green to-rc-green-dark text-white shadow-[0_4px_16px_-4px_rgba(13,148,136,0.55)] ring-1 ring-white/25"
                  : INACTIVE_CHIP[key]
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  active ? "bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]" : STATUS_DOT[key]
                }`}
                aria-hidden
              />
              <span className="whitespace-nowrap">{t(FILTER_LABEL_KEYS[key])}</span>
              <span
                className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums leading-none ${
                  active ? "bg-white/20 text-white" : INACTIVE_BADGE[key]
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
