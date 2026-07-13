"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { PropertyPlanUsage } from "@/services/planTierService";
import { canAutoVerifySlip } from "@/services/planLimits";

interface PlanUsageSkinProps {
  plan: PropertyPlanUsage;
  billingHref?: string;
}

function usePlanWarnings(plan: PropertyPlanUsage) {
  const atProjectLimit = plan.projects_remaining <= 0;
  const atRoomLimit = plan.rooms_remaining <= 0;
  const lineLow =
    plan.line_push_remaining <= Math.max(1, Math.floor(plan.line_push_limit * 0.2));
  const slipAutoDisabled = !canAutoVerifySlip(plan.plan_tier);
  const hasWarning =
    atProjectLimit ||
    atRoomLimit ||
    plan.line_push_remaining === 0 ||
    lineLow ||
    slipAutoDisabled;

  return {
    atProjectLimit,
    atRoomLimit,
    lineLow,
    slipAutoDisabled,
    hasWarning,
  };
}

function PlanUsageModal({
  plan,
  billingHref,
  onClose,
}: PlanUsageSkinProps & { onClose: () => void }) {
  const { t } = useLocale();
  const { atProjectLimit, atRoomLimit, lineLow, slipAutoDisabled } =
    usePlanWarnings(plan);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl rounded-t-xl border border-zinc-200 bg-white shadow-lg sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              {t("owner.plan.detailsTitle")}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {t(`owner.plan.tier.${plan.plan_tier}`)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-lg text-zinc-500 hover:bg-zinc-50"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="space-y-3 px-4 py-4 text-sm">
          <p className="font-semibold text-zinc-900">
            {t("owner.plan.projects", {
              count: plan.project_count,
              limit: plan.project_limit,
            })}
          </p>
          <p
            className={`font-semibold ${
              atRoomLimit ? "text-amber-900" : "text-zinc-900"
            }`}
          >
            {t("owner.plan.roomsTotal", {
              count: plan.room_count,
              limit: plan.room_limit,
            })}
          </p>
          <p
            className={
              plan.line_push_remaining === 0
                ? "text-red-700"
                : lineLow
                  ? "text-amber-800"
                  : "text-zinc-600"
            }
          >
            {t("owner.line.quota", {
              remaining: plan.line_push_remaining,
              limit: plan.line_push_limit,
            })}
          </p>

          {slipAutoDisabled && (
            <p className="text-zinc-600">
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
            <p className="text-amber-800">{t("owner.projectLimitReached")}</p>
          )}
          {atRoomLimit && (
            <p className="text-amber-800">{t("owner.plan.limitReached")}</p>
          )}
          {plan.line_push_remaining === 0 && (
            <p className="text-red-700">{t("owner.line.quotaExceeded")}</p>
          )}

          {billingHref && (
            <a
              href={billingHref}
              className="mt-2 block min-h-11 rounded-lg bg-zinc-900 py-3 text-center font-medium text-white"
            >
              {t("owner.plan.upgradeCta")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlanUsageSkin({ plan, billingHref }: PlanUsageSkinProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const { hasWarning } = usePlanWarnings(plan);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-medium ${
          hasWarning
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-zinc-200 bg-zinc-50 text-zinc-600"
        }`}
      >
        {hasWarning && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
        )}
        <span>{t(`owner.plan.tier.${plan.plan_tier}`)}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <PlanUsageModal
          plan={plan}
          billingHref={billingHref}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
