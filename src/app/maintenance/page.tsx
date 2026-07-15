"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { MaintenanceTicketListSkin } from "@/components/skins/minimal/MaintenanceTicketListSkin";
import { OwnerBottomNavSkin } from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { useMaintenanceTickets } from "@/hooks/useMaintenanceTickets";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";

function MaintenanceContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");

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

  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-24 text-zinc-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {t("owner.maintenance.title")}
          </h1>
          {maintenance.waitingCount > 0 && (
            <p className="mt-2 text-base text-amber-800">
              {t("owner.maintenance.newCount", {
                count: maintenance.waitingCount,
              })}
            </p>
          )}
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
              className="mt-6 inline-flex min-h-14 items-center justify-center rounded-lg bg-rc-green px-6 text-base font-medium text-white hover:bg-rc-green-dark"
            >
              {t("owner.maintenance.backDashboard")}
            </a>
          </div>
        )}

        {maintenance.tickets.length > 0 && (
          <MaintenanceTicketListSkin
            tickets={maintenance.tickets}
            technicianContacts={payment.account?.technician_contacts ?? {}}
            ownerContactPhone={payment.account?.contact_phone ?? null}
            updatingId={maintenance.updatingId}
            onStatusChange={(ticketId, status) => {
              void maintenance.updateStatus(ticketId, status);
            }}
          />
        )}
      </div>

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
