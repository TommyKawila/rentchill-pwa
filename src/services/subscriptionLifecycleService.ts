import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export const GRACE_DAYS = 7;
export const WARNING_DAYS = 7;

export type SubscriptionPhase =
  | "starter"
  | "active"
  | "expiring_soon"
  | "grace"
  | "lapsed";

export type SubscriptionLifecycle = {
  phase: SubscriptionPhase;
  days_until_expiry: number | null;
  grace_days_remaining: number | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((startOfUtcDay(to) - startOfUtcDay(from)) / MS_PER_DAY);
}

export function resolveSubscriptionPhase(
  planTier: PlanTier,
  expiresAt: string | null,
  now = new Date(),
): SubscriptionLifecycle {
  if (planTier === "starter" || !expiresAt) {
    return {
      phase: "starter",
      days_until_expiry: null,
      grace_days_remaining: null,
    };
  }

  const expires = new Date(expiresAt);
  const daysUntil = daysBetween(now, expires);

  if (daysUntil > WARNING_DAYS) {
    return {
      phase: "active",
      days_until_expiry: daysUntil,
      grace_days_remaining: null,
    };
  }

  if (daysUntil >= 0) {
    return {
      phase: "expiring_soon",
      days_until_expiry: daysUntil,
      grace_days_remaining: null,
    };
  }

  const daysPastExpiry = Math.abs(daysUntil);
  const graceRemaining = GRACE_DAYS - daysPastExpiry;

  if (graceRemaining >= 0) {
    return {
      phase: "grace",
      days_until_expiry: daysUntil,
      grace_days_remaining: graceRemaining,
    };
  }

  return {
    phase: "lapsed",
    days_until_expiry: daysUntil,
    grace_days_remaining: 0,
  };
}

export async function downgradeOwnerToStarter(ownerId: string) {
  const supabase = createAdminClient();

  const { error: ownerError } = await supabase
    .from("owners")
    .update({
      plan_tier: "starter",
      status: "expired",
      expires_at: null,
    })
    .eq("id", ownerId);

  if (ownerError) throw ownerError;

  const { error: propertyError } = await supabase
    .from("properties")
    .update({ plan_tier: "starter" })
    .eq("owner_id", ownerId);

  if (propertyError) throw propertyError;
}

export type PaidOwnerRow = {
  id: string;
  plan_tier: PlanTier;
  expires_at: string;
  last_grace_notify_at: string | null;
};

export async function listPaidOwnersForLifecycle(): Promise<PaidOwnerRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("owners")
    .select("id, plan_tier, expires_at, last_grace_notify_at, is_superadmin")
    .neq("plan_tier", "starter")
    .not("expires_at", "is", null);

  if (error) throw error;

  return (data ?? [])
    .filter((row) => !row.is_superadmin)
    .map((row) => ({
      id: String(row.id),
      plan_tier: String(row.plan_tier) as PlanTier,
      expires_at: String(row.expires_at),
      last_grace_notify_at: row.last_grace_notify_at
        ? String(row.last_grace_notify_at)
        : null,
    }));
}

export async function getOwnerLineUserId(ownerId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("properties")
    .select("owner_line_user_id")
    .eq("owner_id", ownerId)
    .not("owner_line_user_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.owner_line_user_id ? String(data.owner_line_user_id) : null;
}

export async function markGraceNotifiedToday(ownerId: string) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("owners")
    .update({ last_grace_notify_at: today })
    .eq("id", ownerId);

  if (error) throw error;
}

export function shouldNotifyGraceToday(
  lastGraceNotifyAt: string | null,
  now = new Date(),
) {
  const today = now.toISOString().slice(0, 10);
  return lastGraceNotifyAt !== today;
}
