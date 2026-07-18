import { PlanGateError } from "@/services/planLimits";
import type { PlanTier } from "@/services/planTierNormalize";
import { getOwnerQuota } from "@/services/ownerQuotaService";
import { getPropertyQuota } from "@/services/propertyQuotaService";

export { PlanGateError };

export async function getPropertyPlanTier(propertySlug: string): Promise<PlanTier> {
  const quota = await getPropertyQuota(propertySlug);
  return quota.plan_tier;
}

export async function assertOwnerWithinRoomLimit(ownerId: string) {
  const quota = await getOwnerQuota(ownerId);
  if (quota.room_count >= quota.room_limit) {
    throw new PlanGateError("ROOM_LIMIT_EXCEEDED");
  }
  return quota;
}

/** Room-cap-only: feature checks removed; keeps room limit assert for owner+property. */
export async function assertOwnerPropertyGated(
  ownerId: string,
  _propertySlug: string,
) {
  return assertOwnerWithinRoomLimit(ownerId);
}

export function planGateResponse(error: unknown) {
  if (error instanceof PlanGateError) {
    return { status: 403 as const, code: error.code };
  }
  return null;
}
