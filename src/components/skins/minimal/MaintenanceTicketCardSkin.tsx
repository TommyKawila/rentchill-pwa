"use client";

import { Film, ImageIcon, Send, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatMaintenanceReportedAt } from "@/services/maintenanceDisplayService";
import type { MaintenanceTicketRow } from "@/services/types";

interface MaintenanceTicketCardSkinProps {
  ticket: MaintenanceTicketRow;
  propertyName: string;
  onOpen: () => void;
  onDispatch?: () => void;
}

function statusDotClass(status: MaintenanceTicketRow["status"]) {
  if (status === "waiting") return "bg-rc-warning";
  if (status === "in_progress") return "bg-sky-500";
  if (status === "done") return "bg-rc-success";
  return "bg-zinc-400";
}

function TicketThumb({ ticket }: { ticket: MaintenanceTicketRow }) {
  const { t } = useLocale();

  if (ticket.photo_url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={ticket.photo_url}
        alt={t("owner.maintenance.photoAlt")}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
    );
  }

  if (ticket.video_url) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
        <Film className="h-6 w-6" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-rc-bg text-rc-green">
      {ticket.description ? (
        <Wrench className="h-5 w-5" strokeWidth={1.5} />
      ) : (
        <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
      )}
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
    <div className="flex h-24 items-center gap-2 rounded-2xl border border-zinc-100/60 bg-white px-3 shadow-sm">
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
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(ticket.status)}`}
          aria-hidden
        />
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
