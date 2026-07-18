"use client";

import { useLocale } from "@/components/LocaleProvider";
import { MaintenanceStatusTabsSkin } from "@/components/skins/minimal/MaintenanceStatusTabsSkin";
import { MaintenanceTicketCardSkin } from "@/components/skins/minimal/MaintenanceTicketCardSkin";
import type {
  MaintenanceTicketRow,
  MaintenanceTicketStatus,
} from "@/services/types";

interface MaintenanceTicketListSkinProps {
  tickets: MaintenanceTicketRow[];
  propertyName: string;
  statusTab: MaintenanceTicketStatus;
  tabCounts: Record<MaintenanceTicketStatus, number>;
  onStatusTabChange: (tab: MaintenanceTicketStatus) => void;
  onOpenDetail: (ticketId: string) => void;
  onDispatchTicket?: (ticket: MaintenanceTicketRow) => void;
}

export function MaintenanceTicketListSkin({
  tickets,
  propertyName,
  statusTab,
  tabCounts,
  onStatusTabChange,
  onOpenDetail,
  onDispatchTicket,
}: MaintenanceTicketListSkinProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <MaintenanceStatusTabsSkin
        activeTab={statusTab}
        tabCounts={tabCounts}
        onTabChange={onStatusTabChange}
      />

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
          {t("owner.maintenance.tabEmpty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <MaintenanceTicketCardSkin
                ticket={ticket}
                propertyName={propertyName}
                onOpen={() => onOpenDetail(ticket.id)}
                onDispatch={
                  onDispatchTicket
                    ? () => onDispatchTicket(ticket)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
