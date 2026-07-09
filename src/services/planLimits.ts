import type { PlanTier } from "@/services/propertyQuotaService";

export const TIER_ROOM_LIMITS: Record<PlanTier, number> = {
  starter: 3,
  micro: 20,
  growth: 50,
  pro: 100,
};

export const TIER_PROJECT_LIMITS: Record<PlanTier, number> = {
  starter: 1,
  micro: 2,
  growth: 5,
  pro: 10,
};

export function getRoomLimit(tier: PlanTier) {
  return TIER_ROOM_LIMITS[tier];
}

export function getProjectLimit(tier: PlanTier) {
  return TIER_PROJECT_LIMITS[tier];
}

export function canAutoVerifySlip(tier: PlanTier) {
  return tier !== "starter";
}
