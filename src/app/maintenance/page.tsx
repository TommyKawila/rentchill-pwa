"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { MaintenanceTicketDetailSkin } from "@/components/skins/minimal/MaintenanceTicketDetailSkin";
import { MaintenanceTicketListSkin } from "@/components/skins/minimal/MaintenanceTicketListSkin";
import { OwnerBottomNavSkin } from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { useMaintenanceTickets } from "@/hooks/useMaintenanceTickets";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";
import { shareMaintenanceDispatch } from "@/services/maintenanceDispatchClientService";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";
import {
  buildMaintenanceDispatchMessage,
  resolveTechnicianContact,
} from "@/services/technicianContactService";
import type { MaintenanceTicketRow, MaintenanceTicketStatus } from "@/services/types";

function MaintenanceContent() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");
  const ticketFromUrl = searchParams.get("ticket");
  const [statusTab, setStatusTab] = useState<MaintenanceTicketStatus>("waiting");
  const [detailId, setDetailId] = useState<string | null>(ticketFromUrl);

  const { properties, status: propertiesStatus } = useOwnerProperties();
  const propertySlug = useMemo(
    () =>
      resolveOwnerPropertySlug(
        slugFromUrl,
        properties,
        propertiesStatus === "loading",
      ),
    [slugFromUrl, properties, propertiesStatus],
  );

  useEffect(() => {
    if (propertiesStatus !== "idle" || properties.length === 0) return;
    if (!propertySlug) return;
    if (slugFromUrl === propertySlug) return;
    router.replace(`/maintenance?property=${encodeURIComponent(propertySlug)}`);
  }, [propertiesStatus, properties.length, slugFromUrl, propertySlug, router]);

  const maintenance = useMaintenanceTickets(propertySlug);
  const payment = usePropertyPaymentSettings(propertySlug);

  const currentProperty = useMemo(
    () => properties.find((p) => p.slug === propertySlug) ?? null,
    [properties, propertySlug],
  );
  const propertyName = currentProperty?.name ?? propertySlug ?? "";

  const tabCounts = useMemo(
    () => ({
      waiting: maintenance.tickets.filter((t) => t.status === "waiting").length,
      in_progress: maintenance.tickets.filter((t) => t.status === "in_progress")
        .length,
      done: maintenance.tickets.filter((t) => t.status === "done").length,
    }),
    [maintenance.tickets],
  );

  const filteredTickets = useMemo(
    () => maintenance.tickets.filter((ticket) => ticket.status === statusTab),
    [maintenance.tickets, statusTab],
  );

  const detailTicket = useMemo(
    () => maintenance.tickets.find((ticket) => ticket.id === detailId) ?? null,
    [maintenance.tickets, detailId],
  );

  useEffect(() => {
    if (!ticketFromUrl || maintenance.status !== "idle") return;
    const ticket = maintenance.tickets.find((item) => item.id === ticketFromUrl);
    if (ticket) {
      setDetailId(ticket.id);
      setStatusTab(ticket.status);
    }
  }, [ticketFromUrl, maintenance.status, maintenance.tickets]);

  const handleDispatchTicket = useCallback(
    async (ticket: MaintenanceTicketRow) => {
      if (!propertySlug) return;
      const contact = resolveTechnicianContact(
        ticket.category,
        payment.account?.technician_contacts ?? {},
        payment.account?.contact_phone ?? null,
        locale,
      );
      const message = buildMaintenanceDispatchMessage(ticket, locale, {
        propertySlug,
      });
      try {
        await shareMaintenanceDispatch({ message, lineUrl: contact.lineUrl });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("[maintenance.dispatch]", { ticketId: ticket.id }, err);
      }
    },
    [propertySlug, payment.account, locale],
  );

  return (
    <main className="min-h-screen bg-rc-bg px-4 py-4 pb-24 text-rc-text">
      <div className="mx-auto max-w-[390px] space-y-4">
        <header>
          <h1 className="text-xl font-bold tracking-tight text-rc-text">
            {t("owner.maintenance.listTitle")}
          </h1>
        </header>

        {maintenance.status === "loading" && maintenance.tickets.length === 0 && (
          <p className="text-base text-zinc-500">{t("common.loading")}</p>
        )}

        {maintenance.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {maintenance.error}
          </p>
        )}

        {maintenance.status === "idle" && maintenance.tickets.length === 0 && (
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
            <p className="text-base font-medium text-zinc-900">
              {t("owner.maintenance.empty")}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {t("owner.maintenance.emptyDesc")}
            </p>
            <a
              href={`/dashboard?property=${encodeURIComponent(propertySlug)}`}
              className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-lg bg-rc-green px-6 text-base font-medium text-white hover:bg-rc-green-dark"
            >
              {t("owner.maintenance.backDashboard")}
            </a>
          </div>
        )}

        {maintenance.tickets.length > 0 && (
          <MaintenanceTicketListSkin
            tickets={filteredTickets}
            propertyName={propertyName}
            statusTab={statusTab}
            tabCounts={tabCounts}
            onStatusTabChange={setStatusTab}
            onOpenDetail={setDetailId}
            onDispatchTicket={(ticket) => void handleDispatchTicket(ticket)}
          />
        )}
      </div>

      {detailTicket && propertySlug && (
        <MaintenanceTicketDetailSkin
          ticket={detailTicket}
          propertySlug={propertySlug}
          technicianContacts={payment.account?.technician_contacts ?? {}}
          ownerContactPhone={payment.account?.contact_phone ?? null}
          busy={maintenance.updatingId === detailTicket.id}
          onClose={() => setDetailId(null)}
          onSave={(input) => maintenance.updateTicket(detailTicket.id, input)}
        />
      )}

      <OwnerBottomNavSkin activeTab="maintenance" propertySlug={propertySlug} />
      <OwnerPushNotificationPrompts />
    </main>
  );
}

export default function MaintenancePage() {
  const { t } = useLocale();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          {t("common.loading")}
        </main>
      }
    >
      <MaintenanceContent />
    </Suspense>
  );
}
