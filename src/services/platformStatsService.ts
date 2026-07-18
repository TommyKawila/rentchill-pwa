import { getLineOaQuotaSnapshot, type LineOaAlertLevel, type LineOaInferredPlan } from "@/services/line/lineOaQuotaService";
import {
  getLinePushByType,
  getLinePushDailyStats,
  getLinePushStatsForMonth,
} from "@/services/linePushQuotaService";
import { createAdminClient } from "@/services/supabase/admin";
import { normalizePlanTier, type PlanTier } from "@/services/planTierNormalize";
import { getSuperadminOwnerId } from "@/services/superadminGuard";

export type { LineOaAlertLevel, LineOaInferredPlan };

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
  line_push_total: number;
  line_push_charged: number;
  line_push_top: Array<{ name: string; slug: string; count: number }>;
  line_internal_total: number;
  line_log_gap: number;
  line_oa_available: boolean;
  line_oa_limit: number | null;
  line_oa_used: number;
  line_oa_remaining: number | null;
  line_oa_percent: number | null;
  line_oa_plan: LineOaInferredPlan;
  line_oa_alert: LineOaAlertLevel;
  line_oa_next_plan: LineOaInferredPlan | null;
  line_push_daily: Array<{ date: string; total: number; charged: number }>;
  line_push_by_type: Array<{ message_type: string; count: number }>;
};

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
    free: 0,
    premium: 0,
  };

  let ownersActive = 0;
  let ownersExpired = 0;

  for (const row of ownerRows) {
    const tier = normalizePlanTier(String(row.plan_tier));
    planBreakdown[tier] += 1;
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

  const [linePush, lineOa, lineDaily, lineByType] = await Promise.all([
    getLinePushStatsForMonth(),
    getLineOaQuotaSnapshot(),
    getLinePushDailyStats(),
    getLinePushByType(),
  ]);

  const internalTotal = linePush.total_pushes;
  const logGap = lineOa.available
    ? Math.max(0, lineOa.quota_used - internalTotal)
    : 0;

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
    line_push_total: internalTotal,
    line_push_charged: linePush.charged_pushes,
    line_push_top: linePush.top_properties,
    line_internal_total: internalTotal,
    line_log_gap: logGap,
    line_oa_available: lineOa.available,
    line_oa_limit: lineOa.quota_limit,
    line_oa_used: lineOa.quota_used,
    line_oa_remaining: lineOa.quota_remaining,
    line_oa_percent: lineOa.usage_percent,
    line_oa_plan: lineOa.inferred_plan,
    line_oa_alert: lineOa.alert_level,
    line_oa_next_plan: lineOa.next_plan_hint,
    line_push_daily: lineDaily,
    line_push_by_type: lineByType,
  };
}
