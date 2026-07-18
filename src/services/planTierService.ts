import {
  getProjectLimit,
  getRoomLimit,
  PREMIUM_PRICE_THB,
  TIER_PROJECT_LIMITS,
  TIER_ROOM_LIMITS,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/planTierNormalize";

export { TIER_PROJECT_LIMITS, TIER_ROOM_LIMITS, getProjectLimit, getRoomLimit, PREMIUM_PRICE_THB };

export type UpgradeTier = "premium";

export const TIER_PRICES_THB: Record<UpgradeTier, number> = {
  premium: PREMIUM_PRICE_THB,
};

export type PropertyPlanUsage = {
  plan_tier: PlanTier;
  project_count: number;
  project_limit: number;
  projects_remaining: number;
  room_count: number;
  room_limit: number;
  rooms_remaining: number;
  line_push_used: number;
  line_push_limit: number;
  line_push_remaining: number;
};

export async function getPropertyPlanUsage(
  propertySlug: string,
): Promise<PropertyPlanUsage> {
  const { getOwnerQuota } = await import("@/services/ownerQuotaService");
  const { getPropertyQuota } = await import("@/services/propertyQuotaService");

  const supabase = (await import("@/services/supabase/admin")).createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, owner_id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบโครงการ");

  const ownerId = property.owner_id ? String(property.owner_id) : null;
  if (!ownerId) throw new Error("ไม่พบเจ้าของโครงการ");

  const ownerQuota = await getOwnerQuota(ownerId);
  const lineQuota = await getPropertyQuota(propertySlug);

  return {
    plan_tier: ownerQuota.plan_tier,
    project_count: ownerQuota.project_count,
    project_limit: ownerQuota.project_limit,
    projects_remaining: ownerQuota.projects_remaining,
    room_count: ownerQuota.room_count,
    room_limit: ownerQuota.room_limit,
    rooms_remaining: ownerQuota.rooms_remaining,
    line_push_used: lineQuota.line_push_used,
    line_push_limit: lineQuota.line_push_limit,
    line_push_remaining: lineQuota.line_push_remaining,
  };
}
