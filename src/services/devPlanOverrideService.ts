import type { PlanTier } from "@/services/propertyQuotaService";
import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { createAdminClient } from "@/services/supabase/admin";

const VALID_TIERS: PlanTier[] = ["starter", "micro", "growth", "pro"];

export async function overrideOwnerPlan(input: {
  owner_email: string;
  plan_tier: PlanTier;
}) {
  const email = input.owner_email.trim().toLowerCase();
  if (!email) throw new Error("EMAIL_REQUIRED");
  if (!VALID_TIERS.includes(input.plan_tier)) {
    throw new Error("INVALID_PLAN_TIER");
  }

  const supabase = createAdminClient();
  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (ownerError) throw ownerError;
  if (!owner) throw new Error("OWNER_NOT_FOUND");

  const ownerId = String(owner.id);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { error: updateOwnerError } = await supabase
    .from("owners")
    .update({
      plan_tier: input.plan_tier,
      status: "active",
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", ownerId);

  if (updateOwnerError) throw updateOwnerError;

  const quotaMonth = getCurrentBillingMonth();
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("owner_id", ownerId);

  if (propertiesError) throw propertiesError;

  if (properties && properties.length > 0) {
    const propertyIds = properties.map((p) => String(p.id));
    const { error: syncError } = await supabase
      .from("properties")
      .update({
        plan_tier: input.plan_tier,
        quota_month: quotaMonth,
        line_push_used_this_month: 0,
        csv_used_this_month: 0,
        reminder_used_this_month: 0,
      })
      .in("id", propertyIds);

    if (syncError) throw syncError;
  }

  return {
    owner_id: ownerId,
    email,
    plan_tier: input.plan_tier,
    expires_at: expiresAt.toISOString(),
    properties_updated: properties?.length ?? 0,
    property_slug: properties?.[0] ? String(properties[0].slug) : null,
  };
}

export async function getOwnerQaSnapshot(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("EMAIL_REQUIRED");

  const supabase = createAdminClient();
  const { data: owner, error } = await supabase
    .from("owners")
    .select("id, email, plan_tier, status, expires_at")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw error;
  if (!owner) throw new Error("OWNER_NOT_FOUND");

  const ownerId = String(owner.id);
  const { data: properties } = await supabase
    .from("properties")
    .select("id, slug, name")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });

  const propertyIds = (properties ?? []).map((p) => String(p.id));
  let roomCount = 0;
  if (propertyIds.length > 0) {
    const { count } = await supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .in("property_id", propertyIds);
    roomCount = count ?? 0;
  }

  return {
    owner_id: ownerId,
    email: String(owner.email),
    plan_tier: String(owner.plan_tier),
    status: String(owner.status),
    expires_at: owner.expires_at ? String(owner.expires_at) : null,
    room_count: roomCount,
    properties: (properties ?? []).map((p) => ({
      id: String(p.id),
      slug: String(p.slug),
      name: String(p.name),
    })),
  };
}
