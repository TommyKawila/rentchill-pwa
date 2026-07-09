"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PropertyPlanUsage } from "@/services/planTierService";

interface PlanUsageSkinProps {
  plan: PropertyPlanUsage;
}

export function PlanUsageSkin({ plan }: PlanUsageSkinProps) {
  const { t } = useLocale();
  const atProjectLimit = plan.projects_remaining <= 0;
  const atRoomLimit = plan.rooms_remaining <= 0;
  const lineLow =
    plan.line_push_remaining <= Math.max(1, Math.floor(plan.line_push_limit * 0.2));

  return (
    <div
      className={`mt-3 rounded-lg border px-4 py-3 ${
        atProjectLimit || atRoomLimit
          ? "border-amber-300 bg-amber-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
          {t(`owner.plan.tier.${plan.plan_tier}`)}
        </p>
        <p
          className={`text-sm font-semibold ${
            atProjectLimit || atRoomLimit ? "text-amber-900" : "text-zinc-900"
          }`}
        >
          {t("owner.plan.projects", {
            count: plan.project_count,
            limit: plan.project_limit,
          })}
        </p>
      </div>

      <p
        className={`mt-1 text-sm font-semibold ${
          atRoomLimit ? "text-amber-900" : "text-zinc-900"
        }`}
      >
        {t("owner.plan.roomsTotal", {
          count: plan.room_count,
          limit: plan.room_limit,
        })}
      </p>

      <p
        className={`mt-2 text-xs ${
          plan.line_push_remaining === 0
            ? "text-red-700"
            : lineLow
              ? "text-amber-800"
              : "text-zinc-600"
        }`}
      >
        {t("owner.line.quota", {
          remaining: plan.line_push_remaining,
          limit: plan.line_push_limit,
        })}
      </p>

      {atProjectLimit && (
        <p className="mt-1 text-xs text-amber-800">
          {t("owner.projectLimitReached")}
        </p>
      )}
      {atRoomLimit && (
        <p className="mt-1 text-xs text-amber-800">{t("owner.plan.limitReached")}</p>
      )}
      {plan.line_push_remaining === 0 && (
        <p className="mt-1 text-xs text-red-700">{t("owner.line.quotaExceeded")}</p>
      )}
    </div>
  );
}
