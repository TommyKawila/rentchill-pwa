"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MaintenanceTicketStatus } from "@/services/types";

const STATUS_TABS: MaintenanceTicketStatus[] = ["waiting", "in_progress", "done"];

const TAB_KEYS: Record<MaintenanceTicketStatus, string> = {
  waiting: "owner.maintenance.tab.waiting",
  in_progress: "owner.maintenance.tab.inProgress",
  done: "owner.maintenance.tab.done",
};

const TAB_EMOJI: Record<MaintenanceTicketStatus, string> = {
  waiting: "🔴",
  in_progress: "🟡",
  done: "🟢",
};

interface MaintenanceStatusTabsSkinProps {
  activeTab: MaintenanceTicketStatus;
  tabCounts: Record<MaintenanceTicketStatus, number>;
  onTabChange: (tab: MaintenanceTicketStatus) => void;
}

export function MaintenanceStatusTabsSkin({
  activeTab,
  tabCounts,
  onTabChange,
}: MaintenanceStatusTabsSkinProps) {
  const { t } = useLocale();

  return (
    <div role="tablist" className="grid grid-cols-3 border-b border-zinc-100">
      {STATUS_TABS.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(tab)}
            className={`min-h-11 px-1 py-2 text-center text-sm transition-colors ${
              active
                ? "border-b-2 border-rc-primary font-bold text-rc-text"
                : "border-b border-transparent font-medium text-zinc-500"
            }`}
          >
            <span className="line-clamp-2 leading-tight">
              {TAB_EMOJI[tab]} {t(TAB_KEYS[tab] as Parameters<typeof t>[0])} (
              {tabCounts[tab]})
            </span>
          </button>
        );
      })}
    </div>
  );
}
