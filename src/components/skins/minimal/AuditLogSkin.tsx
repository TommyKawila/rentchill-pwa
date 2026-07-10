"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { AuditLogRow } from "@/services/auditLogService";
import { canUseAuditLog } from "@/services/planLimits";
import type { MessageKey } from "@/services/i18n/messages";
import type { PlanTier } from "@/services/propertyQuotaService";

interface AuditLogSkinProps {
  planTier: PlanTier;
  entries: AuditLogRow[];
  loading?: boolean;
  error?: string | null;
}

const ACTION_KEYS: Record<string, MessageKey> = {
  "meter.upload": "owner.audit.meterUpload",
  "document.upload": "owner.audit.documentUpload",
  "document.delete": "owner.audit.documentDelete",
  "deposit.update": "owner.audit.depositUpdate",
  "invoice.approve": "owner.audit.invoiceApprove",
  "invoice.reject": "owner.audit.invoiceReject",
  "invoice.meters": "owner.audit.invoiceMeters",
};

export function AuditLogSkin({
  planTier,
  entries,
  loading,
  error,
}: AuditLogSkinProps) {
  const { t } = useLocale();

  if (!canUseAuditLog(planTier)) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold tracking-tight text-zinc-900">
        {t("owner.audit.title")}
      </h3>
      {loading && <p className="text-zinc-500">{t("common.loading")}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {entries.length === 0 && !loading && (
        <p className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-zinc-500">
          {t("owner.audit.empty")}
        </p>
      )}
      {entries.length > 0 && (
        <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
          {entries.slice(0, 12).map((entry) => {
            const key = ACTION_KEYS[entry.action];
            const label = key ? t(key) : entry.action;
            const time = new Date(entry.created_at).toLocaleString("th-TH", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <li key={entry.id} className="px-4 py-3 text-zinc-600">
                <span className="font-medium text-zinc-900">{label}</span>
                <span className="ml-2 text-zinc-400">{time}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
