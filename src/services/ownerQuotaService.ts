import {
  getProjectLimit,
  getRoomLimit,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type OwnerQuota = {
  plan_tier: PlanTier;
  project_count: number;
  project_limit: number;
  projects_remaining: number;
  room_count: number;
  room_limit: number;
  rooms_remaining: number;
};

async function getOwnerTier(ownerId: string): Promise<PlanTier> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("owners")
    .select("plan_tier")
    .eq("id", ownerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบบัญชีเจ้าของ");

  return String(data.plan_tier) as PlanTier;
}

export async function getOwnerQuota(ownerId: string): Promise<OwnerQuota> {
  const supabase = createAdminClient();
  const tier = await getOwnerTier(ownerId);

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", ownerId);

  if (propertiesError) throw propertiesError;

  const propertyIds = (properties ?? []).map((row) => String(row.id));
  const projectCount = propertyIds.length;
  const projectLimit = getProjectLimit(tier);

  let roomCount = 0;
  if (propertyIds.length > 0) {
    const { count, error: countError } = await supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .in("property_id", propertyIds);

    if (countError) throw countError;
    roomCount = count ?? 0;
  }

  const roomLimit = getRoomLimit(tier);

  return {
    plan_tier: tier,
    project_count: projectCount,
    project_limit: projectLimit,
    projects_remaining: Math.max(0, projectLimit - projectCount),
    room_count: roomCount,
    room_limit: roomLimit,
    rooms_remaining: Math.max(0, roomLimit - roomCount),
  };
}

export async function assertOwnerCanAddProject(
  ownerId: string,
  options?: { additionalProjects?: number },
) {
  const quota = await getOwnerQuota(ownerId);
  const additional = options?.additionalProjects ?? 1;

  if (quota.project_count + additional > quota.project_limit) {
    const error = new Error("PROJECT_LIMIT_EXCEEDED");
    Object.assign(error, {
      limit: quota.project_limit,
      total: quota.project_count + additional,
      tier: quota.plan_tier,
    });
    throw error;
  }
}

export async function assertOwnerRoomCapacity(
  ownerId: string,
  options?: {
    propertyId?: string;
    incomingRoomNumbers?: string[];
  },
) {
  const supabase = createAdminClient();
  const quota = await getOwnerQuota(ownerId);
  const propertyId = options?.propertyId;
  const incoming = options?.incomingRoomNumbers ?? [];

  if (!propertyId || incoming.length === 0) {
    if (quota.room_count > quota.room_limit) {
      throwQuotaError(quota);
    }
    return;
  }

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", ownerId);

  if (propertiesError) throw propertiesError;

  const otherPropertyIds = (properties ?? [])
    .map((row) => String(row.id))
    .filter((id) => id !== propertyId);

  let otherRoomCount = 0;
  if (otherPropertyIds.length > 0) {
    const { count, error: countError } = await supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .in("property_id", otherPropertyIds);

    if (countError) throw countError;
    otherRoomCount = count ?? 0;
  }

  const { data: existingRooms, error: roomsError } = await supabase
    .from("rooms")
    .select("room_number")
    .eq("property_id", propertyId);

  if (roomsError) throw roomsError;

  const merged = new Set([
    ...(existingRooms ?? []).map((room) => String(room.room_number)),
    ...incoming,
  ]);

  const totalRooms = otherRoomCount + merged.size;
  if (totalRooms > quota.room_limit) {
    const error = new Error("ROOM_LIMIT_EXCEEDED");
    Object.assign(error, {
      limit: quota.room_limit,
      total: totalRooms,
      tier: quota.plan_tier,
    });
    throw error;
  }
}

function throwQuotaError(quota: OwnerQuota) {
  const error = new Error("ROOM_LIMIT_EXCEEDED");
  Object.assign(error, {
    limit: quota.room_limit,
    total: quota.room_count,
    tier: quota.plan_tier,
  });
  throw error;
}

export async function getPlanTierForPropertyId(propertyId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.owner_id) throw new Error("ไม่พบโครงการ");

  return getOwnerTier(String(data.owner_id));
}
