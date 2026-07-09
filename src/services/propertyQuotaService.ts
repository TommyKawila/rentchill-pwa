import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { getLinePushLimit } from "@/services/linePushQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type PlanTier = "starter" | "micro" | "growth" | "pro";

export type PropertyQuota = {
  plan_tier: PlanTier;
  line_push_used: number;
  line_push_limit: number;
  line_push_remaining: number;
  csv_used: number;
  csv_limit: number | null;
  csv_remaining: number | null;
};

const CSV_LIMIT_STARTER = 1;

function isUnlimitedCsv(tier: PlanTier) {
  return tier !== "starter";
}

async function getPropertyQuotaRow(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, plan_tier, quota_month, line_push_used_this_month, csv_used_this_month",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");
  return data;
}

async function resetQuotaIfNewMonth(
  propertyId: string,
  quotaMonth: string | null,
  currentMonth: string,
) {
  if (quotaMonth === currentMonth) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .update({
      quota_month: currentMonth,
      reminder_used_this_month: 0,
      csv_used_this_month: 0,
      line_push_used_this_month: 0,
    })
    .eq("id", propertyId);

  if (error) throw error;
}

export async function getPropertyQuota(
  propertySlug: string,
): Promise<PropertyQuota> {
  const currentMonth = getCurrentBillingMonth();
  const row = await getPropertyQuotaRow(propertySlug);
  const propertyId = String(row.id);

  await resetQuotaIfNewMonth(
    propertyId,
    row.quota_month ? String(row.quota_month) : null,
    currentMonth,
  );

  const refreshed = await getPropertyQuotaRow(propertySlug);
  const tier = String(refreshed.plan_tier) as PlanTier;
  const linePushUsed = Number(refreshed.line_push_used_this_month);
  const linePushLimit = getLinePushLimit(tier);
  const csvUsed = Number(refreshed.csv_used_this_month);
  const csvUnlimited = isUnlimitedCsv(tier);

  return {
    plan_tier: tier,
    line_push_used: linePushUsed,
    line_push_limit: linePushLimit,
    line_push_remaining: Math.max(0, linePushLimit - linePushUsed),
    csv_used: csvUsed,
    csv_limit: csvUnlimited ? null : CSV_LIMIT_STARTER,
    csv_remaining: csvUnlimited ? null : Math.max(0, CSV_LIMIT_STARTER - csvUsed),
  };
}

export async function consumeCsvQuota(propertySlug: string) {
  const quota = await getPropertyQuota(propertySlug);
  if (quota.csv_limit !== null && quota.csv_used >= quota.csv_limit) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const row = await getPropertyQuotaRow(propertySlug);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .update({
      csv_used_this_month: Number(row.csv_used_this_month) + 1,
    })
    .eq("id", row.id);

  if (error) throw error;
}
