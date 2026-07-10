import type { MessageKey } from "@/services/i18n/messages";
import type { UpgradeTier } from "@/services/planTierService";

export const PLAN_TAGLINES: Record<UpgradeTier, MessageKey> = {
  micro: "owner.planBilling.tagline.micro",
  growth: "owner.planBilling.tagline.growth",
  pro: "owner.planBilling.tagline.pro",
};

/** Benefit-oriented bullets for upgrade cards (includes inherited value). */
export const PLAN_UPGRADE_FEATURES: Record<UpgradeTier, MessageKey[]> = {
  micro: [
    "owner.planBilling.benefit.autoSlip",
    "owner.planBilling.benefit.meterUpload",
    "owner.planBilling.benefit.shareWeek",
    "owner.planBilling.benefit.csvMicro",
    "owner.planBilling.benefit.projectsMicro",
  ],
  growth: [
    "owner.planBilling.benefit.includesMicro",
    "owner.planBilling.benefit.meterHistory",
    "owner.planBilling.benefit.docs",
    "owner.planBilling.benefit.contractPdf",
    "owner.planBilling.benefit.projectsGrowth",
  ],
  pro: [
    "owner.planBilling.benefit.includesGrowth",
    "owner.planBilling.benefit.meterTenant",
    "owner.planBilling.benefit.esign",
    "owner.planBilling.benefit.deposit",
    "owner.planBilling.benefit.bulkMeter",
    "owner.planBilling.benefit.unlimited",
  ],
};
