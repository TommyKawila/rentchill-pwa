"use client";

import { MessageCircle, Phone, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { MaintenanceDetailFooterSkin } from "@/components/skins/minimal/MaintenanceDetailFooterSkin";
import { SlipPinchZoomSkin } from "@/components/skins/minimal/SlipPinchZoomSkin";
import { useTechnicianLineDispatch } from "@/hooks/useTechnicianLineDispatch";
import type { MaintenanceTicketUpdateInput } from "@/hooks/useMaintenanceTickets";
import {
  joinTechnicianContact,
  splitTechnicianContact,
} from "@/services/maintenanceDisplayService";
import {
  buildMaintenanceDispatchMessage,
  resolveTechnicianContact,
  technicianButtonLabel,
} from "@/services/technicianContactService";
import type { MaintenanceTicketRow, TechnicianContacts } from "@/services/types";

interface MaintenanceTicketDetailSkinProps {
  ticket: MaintenanceTicketRow;
  propertySlug: string;
  technicianContacts: TechnicianContacts;
  ownerContactPhone: string | null;
  busy?: boolean;
  onClose: () => void;
  onSave: (input: MaintenanceTicketUpdateInput) => Promise<boolean>;
}

export function MaintenanceTicketDetailSkin({
  ticket,
  propertySlug,
  technicianContacts,
  ownerContactPhone,
  busy,
  onClose,
  onSave,
}: MaintenanceTicketDetailSkinProps) {
  const { t, locale } = useLocale();
  const lineDispatch = useTechnicianLineDispatch();
  const readOnly = ticket.status === "done";
  const [technicianContact, setTechnicianContact] = useState(
    joinTechnicianContact(ticket.technician_name, ticket.technician_phone),
  );
  const [expenseAmount, setExpenseAmount] = useState(
    ticket.expense_amount != null ? String(ticket.expense_amount) : "",
  );

  useEffect(() => {
    setTechnicianContact(
      joinTechnicianContact(ticket.technician_name, ticket.technician_phone),
    );
    setExpenseAmount(
      ticket.expense_amount != null ? String(ticket.expense_amount) : "",
    );
  }, [ticket]);

  const contact = resolveTechnicianContact(
    ticket.category,
    technicianContacts,
    ownerContactPhone,
    locale,
  );

  const dispatchMessage = buildMaintenanceDispatchMessage(ticket, locale, {
    propertySlug,
  });

  const handleDispatch = () => {
    void lineDispatch.dispatch(contact.lineUrl, dispatchMessage);
  };

  const buildPayload = (
    status: MaintenanceTicketUpdateInput["status"],
  ): MaintenanceTicketUpdateInput => {
    const { name, phone } = splitTechnicianContact(technicianContact);
    const expense = expenseAmount.trim() ? Number(expenseAmount) : null;
    return {
      status,
      technician_name: name,
      technician_phone: phone,
      expense_amount: Number.isFinite(expense) ? expense : null,
    };
  };

  const handleConfirmTechnician = async () => {
    const ok = await onSave(buildPayload("in_progress"));
    if (ok) onClose();
  };

  const handleMarkDone = async () => {
    const ok = await onSave(buildPayload("done"));
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[92vh] w-full max-w-[390px] flex-col overflow-hidden rounded-t-xl bg-white"
      >
        <div className="flex justify-center py-2">
          <span className="h-1 w-10 rounded-full bg-zinc-200" aria-hidden />
        </div>

        <div className="space-y-4 overflow-y-auto px-4 pb-28 pt-1">
          {!readOnly && (
            <button
              type="button"
              onClick={handleDispatch}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark"
            >
              <Send className="h-5 w-5" strokeWidth={1.5} />
              {t("owner.maintenance.dispatchTechnician")}
            </button>
          )}

          {lineDispatch.status === "copied" && (
            <p className="text-sm text-rc-success-ink">{t("owner.maintenance.dispatchCopied")}</p>
          )}
          {lineDispatch.fallbackMessage && (
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
              {lineDispatch.fallbackMessage}
            </p>
          )}

          {ticket.photo_url && (
            <SlipPinchZoomSkin
              src={ticket.photo_url}
              alt={t("owner.maintenance.photoAlt")}
              containerClassName="h-[180px] rounded-lg border-0"
            />
          )}
          {ticket.video_url && (
            <video
              src={ticket.video_url}
              controls
              className="h-[180px] w-full rounded-lg border border-zinc-200 object-cover"
            />
          )}

          {!readOnly && (contact.phone || contact.lineUrl) && (
            <div className="flex gap-2">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-x-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.5} />
                  {technicianButtonLabel(contact, t("owner.maintenance.callPrefix"))}
                </a>
              )}
              {contact.lineUrl && (
                <button
                  type="button"
                  onClick={handleDispatch}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-x-1.5 rounded-lg border border-rc-green/30 bg-rc-green-soft text-sm font-medium text-rc-green-ink"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                  {t("owner.maintenance.lineTechnician")}
                </button>
              )}
            </div>
          )}

          <p className="text-sm text-zinc-600">{ticket.description}</p>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-700">
              {t("owner.maintenance.technicianContact")}
            </span>
            <input
              value={technicianContact}
              disabled={busy || readOnly}
              onChange={(event) => setTechnicianContact(event.target.value)}
              placeholder={t("owner.maintenance.technicianPlaceholder")}
              className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-base disabled:bg-zinc-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-rc-text">
              {t("owner.maintenance.expenseAmountLabel")}
            </span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={expenseAmount}
              disabled={busy || readOnly}
              onChange={(event) => setExpenseAmount(event.target.value)}
              placeholder="600"
              className="h-11 w-full rounded-lg border-2 border-rc-primary/40 px-3 text-base tabular-nums focus:border-rc-primary focus:outline-none disabled:bg-zinc-100"
            />
          </label>
        </div>

        <MaintenanceDetailFooterSkin
          status={ticket.status}
          busy={busy}
          onConfirmTechnician={() => void handleConfirmTechnician()}
          onMarkDone={() => void handleMarkDone()}
        />
      </div>
    </div>
  );
}
