import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export type PlatformStats = {
  owners_total: number;
  owners_active: number;
  owners_expired: number;
  properties_total: number;
  rooms_total: number;
  tenants_total: number;
  tenants_line_linked: number;
  pending_payments: number;
  plan_breakdown: Record<PlanTier, number>;
};

import { getSuperadminOwnerId } from "@/services/superadminGuard";

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = createAdminClient();
  const superadminId = getSuperadminOwnerId();

  const { data: owners, error: ownersError } = await supabase
    .from("owners")
    .select("id, plan_tier, status, is_superadmin");

  if (ownersError) throw ownersError;

  const ownerRows = (owners ?? []).filter(
    (row) => !row.is_superadmin && String(row.id) !== superadminId,
  );
  const planBreakdown: Record<PlanTier, number> = {
    starter: 0,
    micro: 0,
    growth: 0,
    pro: 0,
  };

  let ownersActive = 0;
  let ownersExpired = 0;

  for (const row of ownerRows) {
    const tier = String(row.plan_tier) as PlanTier;
    if (tier in planBreakdown) planBreakdown[tier] += 1;
    if (String(row.status) === "expired") ownersExpired += 1;
    else ownersActive += 1;
  }

  const { count: propertiesTotal, error: propertiesError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });

  if (propertiesError) throw propertiesError;

  const { count: roomsTotal, error: roomsError } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true });

  if (roomsError) throw roomsError;

  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("line_user_id");

  if (tenantsError) throw tenantsError;

  const tenantRows = tenants ?? [];
  const tenantsLineLinked = tenantRows.filter((row) => row.line_user_id).length;

  const { count: pendingPayments, error: paymentsError } = await supabase
    .from("platform_payments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (paymentsError) throw paymentsError;

  return {
    owners_total: ownerRows.length,
    owners_active: ownersActive,
    owners_expired: ownersExpired,
    properties_total: propertiesTotal ?? 0,
    rooms_total: roomsTotal ?? 0,
    tenants_total: tenantRows.length,
    tenants_line_linked: tenantsLineLinked,
    pending_payments: pendingPayments ?? 0,
    plan_breakdown: planBreakdown,
  };
}
