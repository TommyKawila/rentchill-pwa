"use client";

import { useCallback, useMemo } from "react";
import { useOwnerProfile } from "@/hooks/useOwnerProfile";
import { usePropertyPlan } from "@/hooks/usePropertyPlan";
import {
  getRoomLimit,
  isPremiumTier,
  PREMIUM_PRICE_THB,
} from "@/services/planLimits";
import { buildOverflowContactLineUrl } from "@/services/overflowContactLineService";
import type { PlanTier } from "@/services/planTierNormalize";

export type AddRoomGate = "allowed" | "free_upgrade" | "premium_overflow";

export function useSubscription(propertySlug: string) {
  const propertyPlan = usePropertyPlan(propertySlug ?? "");
  const ownerProfile = useOwnerProfile();

  const openContactAdminWindow = useCallback(() => {
    const ownerId = ownerProfile.profile?.id;
    if (!ownerId) {
      console.warn("[useSubscription.openContactAdminWindow]", {}, "missing ownerId");
      return;
    }
    const url = buildOverflowContactLineUrl({
      ownerId,
      propertySlug: propertySlug || undefined,
    });
    if (!url) {
      console.warn(
        "[useSubscription.openContactAdminWindow]",
        { ownerId },
        "missing NEXT_PUBLIC_PLATFORM_LINE_OA_URL",
      );
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }, [ownerProfile.profile?.id, propertySlug]);

  return useMemo(() => {
    const plan = propertyPlan.plan;
    const tier: PlanTier = plan?.plan_tier ?? "free";
    const roomLimit = plan?.room_limit ?? getRoomLimit(tier);
    const roomCount = plan?.room_count ?? 0;
    const roomsRemaining = plan?.rooms_remaining ?? Math.max(0, roomLimit - roomCount);
    const atCap = roomCount >= roomLimit;
    const canAddRoom = !atCap;
    const addRoomGate: AddRoomGate = !atCap
      ? "allowed"
      : tier === "premium"
        ? "premium_overflow"
        : "free_upgrade";

    return {
      tier,
      isPremium: isPremiumTier(tier),
      roomLimit,
      roomCount,
      roomsRemaining,
      canAddRoom,
      addRoomGate,
      isPremiumOverflow: addRoomGate === "premium_overflow",
      ownerId: ownerProfile.profile?.id ?? null,
      openContactAdminWindow,
      premiumPrice: PREMIUM_PRICE_THB,
      loading: propertyPlan.status === "loading",
      plan,
    };
  }, [
    propertyPlan.plan,
    propertyPlan.status,
    ownerProfile.profile?.id,
    openContactAdminWindow,
  ]);
}
