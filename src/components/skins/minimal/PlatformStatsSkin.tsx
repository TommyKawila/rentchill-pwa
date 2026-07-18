"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PlatformStats } from "@/services/platformStatsService";
import type { PlanTier } from "@/services/propertyQuotaService";

interface PlatformStatsSkinProps {
  stats: PlatformStats;
}

const PLAN_TIERS: PlanTier[] = ["free", "premium"];

const LINE_TYPE_LABELS: Record<string, string> = {
  bill_issued: "admin.platform.lineType.bill_issued",
  bill_reissued: "admin.platform.lineType.bill_reissued",
  payment_reminder: "admin.platform.lineType.payment_reminder",
  slip_rejected: "admin.platform.lineType.slip_rejected",
  owner_slip_submitted: "admin.platform.lineType.owner_slip_submitted",
  maintenance_reported: "admin.platform.lineType.maintenance_reported",
  payment_confirmed: "admin.platform.lineType.payment_confirmed",
  subscription_grace: "admin.platform.lineType.subscription_grace",
  webhook_fallback: "admin.platform.lineType.webhook_fallback",
};

export function PlatformStatsSkin({ stats }: PlatformStatsSkinProps) {
  const { t } = useLocale();
  const dailyMax = Math.max(1, ...stats.line_push_daily.map((d) => d.total));

  return (
    <div className="mt-8 space-y-4">
      {stats.line_oa_alert === "critical" && stats.line_oa_percent !== null && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t("admin.platform.lineOaCritical", { percent: stats.line_oa_percent })}
        </div>
      )}
      {stats.line_oa_alert === "warning" &&
        stats.line_oa_percent !== null &&
        stats.line_oa_next_plan && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("admin.platform.lineOaWarning", {
              percent: stats.line_oa_percent,
              plan: t(`admin.platform.lineOaPlan.${stats.line_oa_next_plan}`),
            })}
          </div>
        )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("admin.platform.owners")} value={stats.owners_total} />
        <StatCard
          label={t("admin.platform.properties")}
          value={stats.properties_total}
        />
        <StatCard label={t("admin.platform.rooms")} value={stats.rooms_total} />
        <StatCard label={t("admin.platform.tenants")} value={stats.tenants_total} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">{t("admin.platform.subscription")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <p>
            <span className="text-zinc-500">{t("admin.platform.active")}: </span>
            <span className="font-medium text-rc-green-ink">{stats.owners_active}</span>
          </p>
          <p>
            <span className="text-zinc-500">{t("admin.platform.expired")}: </span>
            <span className="font-medium text-amber-700">{stats.owners_expired}</span>
          </p>
          <p>
            <span className="text-zinc-500">{t("admin.platform.lineLinked")}: </span>
            <span className="font-medium">
              {stats.tenants_line_linked}/{stats.tenants_total}
            </span>
          </p>
          <p>
            <span className="text-zinc-500">{t("admin.platform.pendingSlips")}: </span>
            <span className="font-medium text-amber-700">{stats.pending_payments}</span>
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">{t("admin.platform.lineOaTitle")}</h2>
        {!stats.line_oa_available ? (
          <p className="mt-2 text-sm text-zinc-500">
            {t("admin.platform.lineOaUnavailable")}
          </p>
        ) : stats.line_oa_limit !== null ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium">
              {t("admin.platform.lineOaUsage", {
                used: stats.line_oa_used,
                limit: stats.line_oa_limit,
                percent: stats.line_oa_percent ?? 0,
              })}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full ${
                  stats.line_oa_alert === "critical"
                    ? "bg-red-500"
                    : stats.line_oa_alert === "warning"
                      ? "bg-amber-500"
                      : "bg-rc-green"
                }`}
                style={{ width: `${Math.min(100, stats.line_oa_percent ?? 0)}%` }}
              />
            </div>
            <p className="text-sm text-zinc-500">
              {t("admin.platform.lineOaPlan", {
                plan: t(`admin.platform.lineOaPlan.${stats.line_oa_plan}`),
              })}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm">
            {t("admin.platform.lineOaUnlimited", { used: stats.line_oa_used })}
          </p>
        )}
        {stats.line_log_gap > 0 && (
          <p className="mt-2 text-sm text-amber-800">
            {t("admin.platform.lineGap", { gap: stats.line_log_gap })}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">{t("admin.platform.linePushTotal")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <p>
            <span className="text-zinc-500">{t("admin.platform.linePushAll")}: </span>
            <span className="font-medium">{stats.line_internal_total}</span>
          </p>
          <p>
            <span className="text-zinc-500">{t("admin.platform.linePushCharged")}: </span>
            <span className="font-medium">{stats.line_push_charged}</span>
          </p>
        </div>
        {stats.line_push_top.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-zinc-600">
              {t("admin.platform.linePushTop")}
            </p>
            {stats.line_push_top.map((property) => (
              <div
                key={property.slug}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
              >
                <span>{property.name}</span>
                <span className="font-semibold">{property.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {stats.line_push_daily.length > 0 && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold">{t("admin.platform.lineDaily")}</h2>
          <div className="mt-3 flex items-end gap-1" style={{ height: 80 }}>
            {stats.line_push_daily.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-rc-green/70"
                  style={{ height: `${(day.total / dailyMax) * 64}px` }}
                  title={`${day.date}: ${day.total}`}
                />
                <span className="text-sm text-zinc-400">
                  {day.date.slice(8)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.line_push_by_type.length > 0 && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold">{t("admin.platform.lineByType")}</h2>
          <div className="mt-3 space-y-2">
            {stats.line_push_by_type.map((row) => {
              const labelKey = LINE_TYPE_LABELS[row.message_type];
              return (
                <div
                  key={row.message_type}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                >
                  <span>
                    {labelKey
                      ? t(labelKey as Parameters<typeof t>[0])
                      : row.message_type}
                  </span>
                  <span className="font-semibold">{row.count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">{t("admin.platform.planBreakdown")}</h2>
        <div className="mt-3 space-y-2">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
            >
              <span>{t(`owner.plan.tier.${tier}`)}</span>
              <span className="font-semibold">{stats.plan_breakdown[tier]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
