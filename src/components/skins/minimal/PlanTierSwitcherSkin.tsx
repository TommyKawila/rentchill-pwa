"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import type { PlanTier } from "@/services/propertyQuotaService";

const TIERS: PlanTier[] = ["starter", "micro", "growth", "pro"];

const TIER_LABELS: Record<PlanTier, MessageKey> = {
  starter: "owner.plan.tier.starter",
  micro: "owner.plan.tier.micro",
  growth: "owner.plan.tier.growth",
  pro: "owner.plan.tier.pro",
};

interface PlanTierSwitcherSkinProps {
  currentTier: PlanTier;
  disabled?: boolean;
  onSelect: (tier: PlanTier) => void;
}

export function PlanTierSwitcherSkin({
  currentTier,
  disabled,
  onSelect,
}: PlanTierSwitcherSkinProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {t("trial.planSwitcher.label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {TIERS.map((tier) => {
          const active = tier === currentTier;
          return (
            <button
              key={tier}
              type="button"
              disabled={disabled || active}
              onClick={() => onSelect(tier)}
              className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "border-rc-green bg-rc-green-soft text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {t(TIER_LABELS[tier])}
            </button>
          );
        })}
      </div>
    </div>
  );
}
