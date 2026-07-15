"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

interface OwnerDashboardAlertsSkinProps {
  propertiesError?: string | null;
  meterReminder?: string | null;
  lineQuotaHint?: string | null;
  operationError?: string | null;
  maintenanceHref?: string | null;
  maintenanceWaitingCount?: number;
}

export function OwnerDashboardAlertsSkin({
  propertiesError,
  meterReminder,
  lineQuotaHint,
  operationError,
  maintenanceHref,
  maintenanceWaitingCount = 0,
}: OwnerDashboardAlertsSkinProps) {
  const { t } = useLocale();

  const alerts = [
    propertiesError
      ? { message: propertiesError, tone: "red" as const }
      : null,
    operationError
      ? { message: operationError, tone: "red" as const }
      : null,
    meterReminder
      ? { message: meterReminder, tone: "amber" as const }
      : null,
    lineQuotaHint
      ? { message: lineQuotaHint, tone: "amber" as const }
      : null,
  ].filter(Boolean);

  const showMaintenance =
    maintenanceWaitingCount > 0 && maintenanceHref;

  if (alerts.length === 0 && !showMaintenance) return null;

  return (
    <div className="space-y-3">
      {showMaintenance && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-base text-amber-900">
            {t("owner.maintenance.newCount", { count: maintenanceWaitingCount })}
          </p>
          <Link
            href={maintenanceHref}
            className="mt-3 inline-flex min-h-12 items-center text-base font-medium text-zinc-900 underline"
          >
            {t("owner.maintenance.viewTickets")}
          </Link>
        </div>
      )}
      {alerts.map((alert) => {
        if (!alert) return null;
        const toneClass =
          alert.tone === "red"
            ? "border-red-200 bg-red-50 text-base text-red-600"
            : "border-amber-200 bg-amber-50 text-base text-amber-900";

        return (
          <p
            key={alert.message}
            className={`rounded-xl border px-4 py-3 ${toneClass}`}
          >
            {alert.message}
          </p>
        );
      })}
    </div>
  );
}
