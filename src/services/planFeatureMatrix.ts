import type { PlanTier } from "@/services/planTierNormalize";
import { PREMIUM_PRICE_THB, TIER_ROOM_LIMITS } from "@/services/planLimits";

export type PlanMatrixRow = {
  id: string;
  free: boolean | string;
  premium: boolean | string;
};

export const PLAN_TIER_ORDER: PlanTier[] = ["free", "premium"];

export const PLAN_TIER_PRICES: Record<PlanTier, number> = {
  free: 0,
  premium: PREMIUM_PRICE_THB,
};

export function planRoomLimit(tier: PlanTier) {
  return TIER_ROOM_LIMITS[tier];
}

/** i18n keys under landing.pricing.matrix.* */
export const PLAN_FEATURE_MATRIX_ROWS: { id: string }[] = [
  { id: "rooms" },
  { id: "billing" },
  { id: "lineAuto" },
  { id: "reminders" },
  { id: "autoSlip" },
  { id: "analyticsExport" },
  { id: "docs" },
  { id: "maintenance" },
  { id: "contractPdf" },
  { id: "esign" },
  { id: "bulkMeter" },
  { id: "moveDeposit" },
];

export function matrixCellValue(rowId: string, tier: PlanTier): boolean | string {
  if (rowId === "rooms") return String(planRoomLimit(tier));
  return true;
}
