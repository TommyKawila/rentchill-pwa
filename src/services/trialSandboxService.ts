import type { PlanTier } from "@/services/propertyQuotaService";

const DEFAULT_TRIAL_OWNER_ID = "00000000-0000-0000-0000-000000000020";
const DEFAULT_TRIAL_PROPERTY_SLUG = "trial-apartment";
const DEFAULT_TRIAL_INVITE_CODE = "RCTRY1";
const VALID_TIERS: PlanTier[] = ["starter", "micro", "growth", "pro"];

export function isTrialEnabled() {
  return process.env.TRIAL_ENABLED === "true";
}

export function getTrialOwnerId() {
  return process.env.TRIAL_OWNER_ID?.trim() || DEFAULT_TRIAL_OWNER_ID;
}

export function getTrialPropertySlug() {
  return process.env.TRIAL_PROPERTY_SLUG?.trim() || DEFAULT_TRIAL_PROPERTY_SLUG;
}

export function getTrialTenantInviteCode() {
  return process.env.TRIAL_TENANT_INVITE_CODE?.trim() || DEFAULT_TRIAL_INVITE_CODE;
}

export function isTrialOwner(ownerId: string | null | undefined) {
  if (!ownerId) return false;
  return ownerId === getTrialOwnerId();
}

export function isTrialProperty(slug: string | null | undefined) {
  if (!slug) return false;
  return slug === getTrialPropertySlug();
}

export function assertTrialEnabled() {
  if (!isTrialEnabled()) throw new Error("TRIAL_DISABLED");
}

export function assertTrialOwner(ownerId: string) {
  if (!isTrialOwner(ownerId)) throw new Error("NOT_TRIAL_OWNER");
}

export function assertTrialContext(ownerId: string, propertySlug?: string) {
  assertTrialOwner(ownerId);
  if (propertySlug && !isTrialProperty(propertySlug)) {
    throw new Error("TRIAL_PROPERTY_ONLY");
  }
}

export function assertNotTrialOwnerMutation(ownerId: string) {
  if (isTrialOwner(ownerId)) throw new Error("TRIAL_MUTATION_BLOCKED");
}

export function parseTrialPlanTier(raw: string | null | undefined): PlanTier {
  const tier = raw?.trim().toLowerCase() as PlanTier;
  if (tier && VALID_TIERS.includes(tier)) return tier;
  return "growth";
}

export function getTrialResetIntervalMs() {
  return 24 * 60 * 60 * 1000;
}

export function getNextTrialResetAt(resetAt: string | null) {
  const base = resetAt ? new Date(resetAt).getTime() : Date.now();
  return new Date(base + getTrialResetIntervalMs()).toISOString();
}
