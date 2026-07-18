"use client";

import { ChevronRight, Film, ImageIcon, Send } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatMaintenanceReportedAt } from "@/services/maintenanceDisplayService";
import type { MaintenanceTicketRow } from "@/services/types";

interface MaintenanceTicketCardSkinProps {
  ticket: MaintenanceTicketRow;
  propertyName: string;
  onOpen: () => void;
  onDispatch?: () => void;
}

function TicketThumb({ ticket }: { ticket: MaintenanceTicketRow }) {
  const { t } = useLocale();

  if (ticket.photo_url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={ticket.photo_url}
        alt={t("owner.maintenance.photoAlt")}
        className="h-16 w-16 shrink-0 rounded-md object-cover"
      />
    );
  }

  if (ticket.video_url) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
        <Film className="h-6 w-6" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-zinc-400">
      <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
    </div>
  );
}

export function MaintenanceTicketCardSkin({
  ticket,
  propertyName,
  onOpen,
  onDispatch,
}: MaintenanceTicketCardSkinProps) {
  const { t, locale } = useLocale();
  const reportedWhen = formatMaintenanceReportedAt(ticket.created_at, locale);
  const showDispatch =
    onDispatch && (ticket.status === "waiting" || ticket.status === "in_progress");

  return (
    <div className="flex h-24 items-center gap-2 rounded-xl bg-white px-3 shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <TicketThumb ticket={ticket} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-rc-text">
            {propertyName} - {t("common.room", { number: ticket.room_number })}
          </p>
          <p className="mt-0.5 line-clamp-1 text-sm text-zinc-600">
            {t("owner.maintenance.problemPrefix")} {ticket.description}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {t("owner.maintenance.reportedAt", { when: reportedWhen })}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-300">
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </span>
      </button>
      {showDispatch && (
        <button
          type="button"
          aria-label={t("owner.maintenance.dispatchTechnician")}
          onClick={(event) => {
            event.stopPropagation();
            onDispatch();
          }}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rc-green text-white hover:bg-rc-green-dark"
        >
          <Send className="h-5 w-5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
