"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PlatformStats } from "@/services/platformStatsService";
import type { PlanTier } from "@/services/propertyQuotaService";

interface PlatformStatsSkinProps {
  stats: PlatformStats;
}

const PLAN_TIERS: PlanTier[] = ["starter", "micro", "growth", "pro"];

export function PlatformStatsSkin({ stats }: PlatformStatsSkinProps) {
  const { t } = useLocale();

  return (
    <div className="mt-8 space-y-4">
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
            <span className="font-medium text-green-700">{stats.owners_active}</span>
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
        <h2 className="text-sm font-semibold">{t("admin.platform.planBreakdown")}</h2>
        <div className="mt-3 space-y-2">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier}
              className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm"
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
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
