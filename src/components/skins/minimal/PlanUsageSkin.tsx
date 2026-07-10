"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PropertyPlanUsage } from "@/services/planTierService";
import { canAutoVerifySlip } from "@/services/planLimits";

interface PlanUsageSkinProps {
  plan: PropertyPlanUsage;
  billingHref?: string;
}

export function PlanUsageSkin({ plan, billingHref }: PlanUsageSkinProps) {
  const { t } = useLocale();
  const atProjectLimit = plan.projects_remaining <= 0;
  const atRoomLimit = plan.rooms_remaining <= 0;
  const lineLow =
    plan.line_push_remaining <= Math.max(1, Math.floor(plan.line_push_limit * 0.2));
  const slipAutoDisabled = !canAutoVerifySlip(plan.plan_tier);

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        atProjectLimit || atRoomLimit
          ? "border-amber-200 bg-amber-50"
          : "border-zinc-100 bg-zinc-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-zinc-600">
          {t(`owner.plan.tier.${plan.plan_tier}`)}
        </p>
        <p
          className={`font-semibold ${
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
        className={`mt-1 font-semibold ${
          atRoomLimit ? "text-amber-900" : "text-zinc-900"
        }`}
      >
        {t("owner.plan.roomsTotal", {
          count: plan.room_count,
          limit: plan.room_limit,
        })}
      </p>

      <p
        className={`mt-2 ${
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

      {slipAutoDisabled && (
        <p className="mt-2 text-zinc-600">
          {t("owner.plan.slipVerifyStarter")}
          {billingHref && (
            <>
              {" "}
              <a href={billingHref} className="font-medium underline">
                {t("owner.plan.slipVerifyUpgrade")}
              </a>
            </>
          )}
        </p>
      )}

      {atProjectLimit && (
        <p className="mt-1 text-amber-800">{t("owner.projectLimitReached")}</p>
      )}
      {atRoomLimit && (
        <p className="mt-1 text-amber-800">{t("owner.plan.limitReached")}</p>
      )}
      {plan.line_push_remaining === 0 && (
        <p className="mt-1 text-red-700">{t("owner.line.quotaExceeded")}</p>
      )}
    </div>
  );
}
