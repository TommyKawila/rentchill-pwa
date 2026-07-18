import type { MessageKey } from "@/services/i18n/messages";
import type { UpgradeTier } from "@/services/planTierService";

export const PLAN_TAGLINES: Record<UpgradeTier, MessageKey> = {
  premium: "owner.planBilling.tagline.premium",
};

export const PLAN_UPGRADE_FEATURES: Record<UpgradeTier, MessageKey[]> = {
  premium: [
    "owner.planBilling.benefit.lineAuto",
    "owner.planBilling.benefit.autoRemind",
    "owner.planBilling.benefit.autoSlip",
    "owner.planBilling.benefit.analyticsExport",
    "owner.planBilling.benefit.maintenance",
    "owner.planBilling.benefit.roomsPremium",
  ],
};
