import { getOwnerQuota } from "@/services/ownerQuotaService";
import {
  getProjectLimit,
  getRoomLimit,
  TIER_PROJECT_LIMITS,
  TIER_ROOM_LIMITS,
} from "@/services/planLimits";
import { getPropertyQuota } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export { TIER_PROJECT_LIMITS, TIER_ROOM_LIMITS, getProjectLimit, getRoomLimit };

export type UpgradeTier = Exclude<PlanTier, "starter">;

export const TIER_PRICES_THB: Record<UpgradeTier, number> = {
  micro: 290,
  growth: 590,
  pro: 990,
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
  const supabase = createAdminClient();

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
