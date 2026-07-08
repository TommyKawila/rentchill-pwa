"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PropertyPlanUsage } from "@/services/planTierService";

interface PlanUsageSkinProps {
  plan: PropertyPlanUsage;
}

export function PlanUsageSkin({ plan }: PlanUsageSkinProps) {
  const { t } = useLocale();
  const atLimit = plan.rooms_remaining <= 0;

  return (
    <div
      className={`mt-3 rounded-lg border px-4 py-3 ${
        atLimit
          ? "border-amber-300 bg-amber-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
          {t(`owner.plan.tier.${plan.plan_tier}`)}
        </p>
        <p className={`text-sm font-semibold ${atLimit ? "text-amber-900" : "text-zinc-900"}`}>
          {t("owner.plan.rooms", {
            count: plan.room_count,
            limit: plan.room_limit,
          })}
        </p>
      </div>
      {atLimit && (
        <p className="mt-1 text-xs text-amber-800">{t("owner.plan.limitReached")}</p>
      )}
    </div>
  );
}
