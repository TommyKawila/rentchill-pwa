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

export const CSV_LIMITS: Record<PlanTier, number | null> = {
  starter: 1,
  micro: 5,
  growth: 20,
  pro: null,
};

export function getCsvLimit(tier: PlanTier) {
  return CSV_LIMITS[tier];
}

export function canUploadMeterPhoto(tier: PlanTier) {
  return tier !== "starter";
}

export function canBrowseMeterHistory(tier: PlanTier) {
  return tier === "growth" || tier === "pro";
}

export function meterHistoryMonthLimit(tier: PlanTier): number | null {
  if (tier === "growth") return 12;
  if (tier === "pro") return null;
  return 1;
}

export function canTenantViewMeterPhotos(tier: PlanTier) {
  return tier === "pro";
}

export function canUseDocumentVault(tier: PlanTier) {
  return tier === "growth" || tier === "pro";
}

export type DocumentType =
  | "id_card"
  | "passport"
  | "lease"
  | "contract_signed"
  | "move_in"
  | "move_out"
  | "deposit_receipt";

const GROWTH_DOC_TYPES: DocumentType[] = ["id_card", "passport", "lease"];
const PRO_EXTRA_DOC_TYPES: DocumentType[] = [
  "contract_signed",
  "move_in",
  "move_out",
  "deposit_receipt",
];

export const TENANT_UPLOAD_DOC_TYPES: DocumentType[] = ["id_card", "passport"];

export function allowedDocumentTypes(tier: PlanTier): DocumentType[] {
  if (!canUseDocumentVault(tier)) return [];
  if (tier === "growth") return GROWTH_DOC_TYPES;
  return [...GROWTH_DOC_TYPES, ...PRO_EXTRA_DOC_TYPES];
}

export function documentCountLimit(tier: PlanTier): number | null {
  if (tier === "growth") return 8;
  if (tier === "pro") return null;
  return 0;
}

export function canTenantUploadDocuments(tier: PlanTier) {
  return tier === "pro";
}

export function canTenantSignContract(tier: PlanTier) {
  return tier === "pro";
}

export function canGenerateContractPdf(tier: PlanTier) {
  return tier === "growth" || tier === "pro";
}

export function canUseESign(tier: PlanTier) {
  return tier === "pro";
}

export function canUseProPolish(tier: PlanTier) {
  return tier === "pro";
}

export function canUseDepositTracker(tier: PlanTier) {
  return canUseProPolish(tier);
}

export function canUseAuditLog(tier: PlanTier) {
  return canUseProPolish(tier);
}

export function canUseBulkMeterDay(tier: PlanTier) {
  return canUseProPolish(tier);
}

export function canUseMoveChecklist(tier: PlanTier) {
  return canUseProPolish(tier);
}

export function shareLinkExpiresMs(tier: PlanTier): number | null {
  switch (tier) {
    case "starter":
      return 24 * 60 * 60 * 1000;
    case "micro":
      return 7 * 24 * 60 * 60 * 1000;
    case "growth":
      return 30 * 24 * 60 * 60 * 1000;
    case "pro":
      return null;
  }
}
