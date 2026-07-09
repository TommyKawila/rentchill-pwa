import { getPropertyQuota } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export const TIER_ROOM_LIMITS: Record<PlanTier, number> = {
  starter: 3,
  micro: 20,
  growth: 50,
  pro: 100,
};

export type UpgradeTier = Exclude<PlanTier, "starter">;

export const TIER_PRICES_THB: Record<UpgradeTier, number> = {
  micro: 290,
  growth: 590,
  pro: 990,
};

export type PropertyPlanUsage = {
  plan_tier: PlanTier;
  room_count: number;
  room_limit: number;
  rooms_remaining: number;
  line_push_used: number;
  line_push_limit: number;
  line_push_remaining: number;
};

export function getRoomLimit(tier: PlanTier) {
  return TIER_ROOM_LIMITS[tier];
}

export async function getPropertyPlanUsage(
  propertySlug: string,
): Promise<PropertyPlanUsage> {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, plan_tier")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const tier = String(property.plan_tier) as PlanTier;
  const roomLimit = getRoomLimit(tier);

  const { count, error: countError } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("property_id", property.id);

  if (countError) throw countError;

  const roomCount = count ?? 0;
  const quota = await getPropertyQuota(propertySlug);

  return {
    plan_tier: tier,
    room_count: roomCount,
    room_limit: roomLimit,
    rooms_remaining: Math.max(0, roomLimit - roomCount),
    line_push_used: quota.line_push_used,
    line_push_limit: quota.line_push_limit,
    line_push_remaining: quota.line_push_remaining,
  };
}

export async function assertRoomCapacity(
  propertyId: string,
  propertySlug: string,
  incomingRoomNumbers: string[],
) {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("plan_tier")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const tier = String(property.plan_tier) as PlanTier;
  const roomLimit = getRoomLimit(tier);

  const { data: existingRooms, error: roomsError } = await supabase
    .from("rooms")
    .select("room_number")
    .eq("property_id", propertyId);

  if (roomsError) throw roomsError;

  const merged = new Set([
    ...(existingRooms ?? []).map((room) => String(room.room_number)),
    ...incomingRoomNumbers,
  ]);

  if (merged.size > roomLimit) {
    const error = new Error("ROOM_LIMIT_EXCEEDED");
    Object.assign(error, {
      slug: propertySlug,
      limit: roomLimit,
      total: merged.size,
      tier,
    });
    throw error;
  }
}
