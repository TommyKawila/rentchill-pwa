"use client";

interface OwnerDashboardAlertsSkinProps {
  propertiesError?: string | null;
  meterReminder?: string | null;
  lineQuotaHint?: string | null;
  operationError?: string | null;
}

export function OwnerDashboardAlertsSkin({
  propertiesError,
  meterReminder,
  lineQuotaHint,
  operationError,
}: OwnerDashboardAlertsSkinProps) {
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

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        if (!alert) return null;
        const toneClass =
          alert.tone === "red"
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-amber-200 bg-amber-50 text-amber-900";

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
