"use client";

import { MessageCircle, Phone, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useTechnicianLineDispatch } from "@/hooks/useTechnicianLineDispatch";
import {
  buildMaintenanceDispatchMessage,
  resolveTechnicianContact,
  technicianButtonLabel,
  type ResolvedTechnicianContact,
} from "@/services/technicianContactService";
import type {
  MaintenanceTicketRow,
  MaintenanceTicketStatus,
  TechnicianContacts,
} from "@/services/types";

interface MaintenanceTicketListSkinProps {
  tickets: MaintenanceTicketRow[];
  technicianContacts: TechnicianContacts;
  ownerContactPhone: string | null;
  updatingId: string | null;
  onStatusChange: (ticketId: string, status: MaintenanceTicketStatus) => void;
}

const STATUS_TONE: Record<
  MaintenanceTicketStatus,
  { badge: string; labelKey: string }
> = {
  waiting: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    labelKey: "owner.maintenance.status.waiting",
  },
  in_progress: {
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    labelKey: "owner.maintenance.status.inProgress",
  },
  done: {
    badge: "bg-green-50 text-green-700 border-green-200",
    labelKey: "owner.maintenance.status.done",
  },
};

const CATEGORY_KEYS = {
  ac: "owner.maintenance.category.ac",
  plumbing: "owner.maintenance.category.plumbing",
  electrical: "owner.maintenance.category.electrical",
  other: "owner.maintenance.category.other",
} as const;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function TechnicianActions({
  ticket,
  contact,
}: {
  ticket: MaintenanceTicketRow;
  contact: ResolvedTechnicianContact;
}) {
  const { t, locale } = useLocale();
  const lineDispatch = useTechnicianLineDispatch();

  const callLabel = technicianButtonLabel(
    contact,
    t("owner.maintenance.callPrefix"),
  );

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {contact.phone && (
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-x-2 rounded-lg border border-zinc-200 bg-zinc-50 text-base font-medium text-zinc-900"
          >
            <Phone className="h-5 w-5" strokeWidth={1.5} />
            {callLabel}
          </a>
        )}
        {contact.lineUrl && (
          <button
            type="button"
            onClick={() =>
              void lineDispatch.dispatch(
                contact.lineUrl!,
                buildMaintenanceDispatchMessage(ticket, locale),
              )
            }
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-x-2 rounded-lg border border-rc-green/30 bg-rc-green-soft text-base font-medium text-rc-green-ink"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
            {t("owner.maintenance.lineTechnician")}
          </button>
        )}
      </div>

      {lineDispatch.status === "copied" && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t("owner.maintenance.lineCopied")}
        </p>
      )}

      {lineDispatch.status === "fallback" && lineDispatch.fallbackMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">{t("owner.maintenance.lineCopyManual")}</p>
          <p className="mt-2 whitespace-pre-wrap text-zinc-800">
            {lineDispatch.fallbackMessage}
          </p>
        </div>
      )}
    </div>
  );
}

export function MaintenanceTicketListSkin({
  tickets,
  technicianContacts,
  ownerContactPhone,
  updatingId,
  onStatusChange,
}: MaintenanceTicketListSkinProps) {
  const { t, locale } = useLocale();

  return (
    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
      {tickets.map((ticket) => {
        const tone = STATUS_TONE[ticket.status];
        const isUpdating = updatingId === ticket.id;
        const contact = resolveTechnicianContact(
          ticket.category,
          technicianContacts,
          ownerContactPhone,
          locale,
        );
        const hasContactAction = Boolean(contact.phone || contact.lineUrl);

        return (
          <li key={ticket.id} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-bold text-zinc-900">
                  {t("common.room", { number: ticket.room_number })}
                  <span className="font-medium text-zinc-500">
                    {" "}
                    · {ticket.tenant_name}
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {t(CATEGORY_KEYS[ticket.category] as Parameters<typeof t>[0])} ·{" "}
                  {formatDate(ticket.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${tone.badge}`}
              >
                {t(tone.labelKey as Parameters<typeof t>[0])}
              </span>
            </div>

            <p className="mt-3 text-base text-zinc-800">{ticket.description}</p>

            {ticket.photo_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={ticket.photo_url}
                alt={t("owner.maintenance.photoAlt")}
                className="mt-3 max-h-48 w-full rounded-lg border border-zinc-200 object-cover"
              />
            )}

            {hasContactAction && (
              <TechnicianActions ticket={ticket} contact={contact} />
            )}

            {ticket.status !== "done" && (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                {ticket.status === "waiting" && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onStatusChange(ticket.id, "in_progress")}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-x-2 rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Wrench className="h-5 w-5" strokeWidth={1.5} />
                    {isUpdating
                      ? t("common.loading")
                      : t("owner.maintenance.markInProgress")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(ticket.id, "done")}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-green-700 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating
                    ? t("common.loading")
                    : t("owner.maintenance.markDone")}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
