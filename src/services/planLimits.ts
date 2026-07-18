import type { PlanTier } from "@/services/planTierNormalize";

export const PREMIUM_PRICE_THB = 299;

export const TIER_ROOM_LIMITS: Record<PlanTier, number> = {
  free: 1,
  premium: 20,
};

export const TIER_PROJECT_LIMITS: Record<PlanTier, number> = {
  free: 1,
  premium: 3,
};

export const STARTER_MANUAL_DOC_LIMIT = 3;

export const STARTER_DOC_TYPES = ["id_card", "passport", "lease"] as const;

export function getRoomLimit(tier: PlanTier) {
  return TIER_ROOM_LIMITS[tier];
}

export function getProjectLimit(tier: PlanTier) {
  return TIER_PROJECT_LIMITS[tier];
}

export function isWithinRoomLimit(tier: PlanTier, roomCount: number) {
  return roomCount <= getRoomLimit(tier);
}

export function isPremiumTier(tier: PlanTier) {
  return tier === "premium";
}

/** Room-cap-only model: all feature modules unlocked for both tiers. */
export function canSendBillViaLineOa(_tier: PlanTier) {
  return true;
}

export function canUseAutoReminders(_tier: PlanTier) {
  return true;
}

export function canAutoVerifySlip(_tier: PlanTier) {
  return true;
}

export function canUseStarterManualDocs(_tier: PlanTier) {
  return false;
}

export function canExportAnalytics(_tier: PlanTier) {
  return true;
}

export function canUseMaintenanceLog(_tier: PlanTier) {
  return true;
}

export const CSV_LIMITS: Record<PlanTier, number | null> = {
  free: null,
  premium: null,
};

export function getCsvLimit(_tier: PlanTier) {
  return null;
}

export function canUploadMeterPhoto(_tier: PlanTier) {
  return true;
}

export function canBrowseMeterHistory(_tier: PlanTier) {
  return true;
}

export function meterHistoryMonthLimit(_tier: PlanTier): number | null {
  return null;
}

export function canTenantViewMeterPhotos(_tier: PlanTier) {
  return true;
}

export function canUseDocumentVault(_tier: PlanTier) {
  return true;
}

export function canAccessDocuments(_tier: PlanTier) {
  return true;
}

export type DocumentType =
  | "id_card"
  | "passport"
  | "lease"
  | "contract_signed"
  | "move_in"
  | "move_out"
  | "deposit_receipt";

const ALL_DOC_TYPES: DocumentType[] = [
  "id_card",
  "passport",
  "lease",
  "contract_signed",
  "move_in",
  "move_out",
  "deposit_receipt",
];

export const TENANT_UPLOAD_DOC_TYPES: DocumentType[] = ["id_card", "passport"];

export function allowedDocumentTypes(_tier: PlanTier): DocumentType[] {
  return ALL_DOC_TYPES;
}

export function documentCountLimit(_tier: PlanTier): number | null {
  return null;
}

export function canTenantUploadDocuments(_tier: PlanTier) {
  return true;
}

export function canTenantSignContract(_tier: PlanTier) {
  return true;
}

export function canGenerateContractPdf(_tier: PlanTier) {
  return true;
}

export function canUseESign(_tier: PlanTier) {
  return true;
}

export function canUseProPolish(_tier: PlanTier) {
  return true;
}

export function canUseDepositTracker(_tier: PlanTier) {
  return true;
}

export function canUseAuditLog(_tier: PlanTier) {
  return true;
}

export function canUseBulkMeterDay(_tier: PlanTier) {
  return true;
}

export function canUseMoveChecklist(_tier: PlanTier) {
  return true;
}

export function shareLinkExpiresMs(_tier: PlanTier): number | null {
  return null;
}

export class PlanGateError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export function assertPlanGate(condition: boolean, code: string) {
  if (!condition) throw new PlanGateError(code);
}
