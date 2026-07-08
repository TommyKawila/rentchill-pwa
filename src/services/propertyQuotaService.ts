import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { createAdminClient } from "@/services/supabase/admin";

export type PlanTier = "starter" | "micro" | "growth" | "pro";

export type PropertyQuota = {
  plan_tier: PlanTier;
  reminder_used: number;
  csv_used: number;
  reminder_limit: number | null;
  reminders_remaining: number | null;
  csv_limit: number | null;
  csv_remaining: number | null;
};

const REMINDER_LIMIT_STARTER = 1;
const CSV_LIMIT_STARTER = 1;

function isUnlimited(tier: PlanTier) {
  return tier !== "starter";
}

async function getPropertyQuotaRow(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, plan_tier, quota_month, reminder_used_this_month, csv_used_this_month",
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
  const reminderUsed = Number(refreshed.reminder_used_this_month);
  const csvUsed = Number(refreshed.csv_used_this_month);
  const unlimited = isUnlimited(tier);

  return {
    plan_tier: tier,
    reminder_used: reminderUsed,
    csv_used: csvUsed,
    reminder_limit: unlimited ? null : REMINDER_LIMIT_STARTER,
    reminders_remaining: unlimited
      ? null
      : Math.max(0, REMINDER_LIMIT_STARTER - reminderUsed),
    csv_limit: unlimited ? null : CSV_LIMIT_STARTER,
    csv_remaining: unlimited ? null : Math.max(0, CSV_LIMIT_STARTER - csvUsed),
  };
}

export async function consumeReminderQuota(propertySlug: string) {
  const quota = await getPropertyQuota(propertySlug);
  if (
    quota.reminder_limit !== null &&
    quota.reminder_used >= quota.reminder_limit
  ) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const row = await getPropertyQuotaRow(propertySlug);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .update({
      reminder_used_this_month: Number(row.reminder_used_this_month) + 1,
    })
    .eq("id", row.id);

  if (error) throw error;
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
