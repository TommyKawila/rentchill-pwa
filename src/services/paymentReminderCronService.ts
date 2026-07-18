import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import {
  REMINDER_TIER_ORDER,
  type ReminderTier,
} from "@/services/paymentReminderTier";
import { sendPaymentReminderBulk } from "@/services/reminderService";
import { createAdminClient } from "@/services/supabase/admin";

export type PaymentReminderCronResult = {
  processed: number;
  sent: number;
  skipped: number;
  quotaBlocked: number;
};

export async function listPropertiesForPaymentReminderCron(): Promise<string[]> {
  const billingMonth = getCurrentBillingMonth();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("properties!inner(slug, plan_tier), tenants!inner(line_user_id)")
    .eq("billing_month", billingMonth)
    .eq("status", "pending")
    .not("tenants.line_user_id", "is", null);

  if (error) throw error;

  const slugs = new Set<string>();
  for (const row of data ?? []) {
    const propertyRaw = row.properties as
      | { slug: string; plan_tier: string }
      | { slug: string; plan_tier: string }[];
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
    if (!property?.slug) continue;
    slugs.add(String(property.slug));
  }

  return [...slugs].sort();
}

export async function runPaymentReminderCron(): Promise<PaymentReminderCronResult> {
  const slugs = await listPropertiesForPaymentReminderCron();
  let sent = 0;
  let skipped = 0;
  let quotaBlocked = 0;

  for (const slug of slugs) {
    let propertyQuotaBlocked = false;

    for (const tier of REMINDER_TIER_ORDER as ReminderTier[]) {
      if (propertyQuotaBlocked) break;

      try {
        const result = await sendPaymentReminderBulk(slug, tier);
        sent += result.sent;
        skipped += result.skipped;
      } catch (error) {
        if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
          console.error("[paymentReminderCron.run]", { slug }, error);
          quotaBlocked += 1;
          propertyQuotaBlocked = true;
          continue;
        }
        console.error("[paymentReminderCron.run]", { slug, tier }, error);
      }
    }
  }

  return {
    processed: slugs.length,
    sent,
    skipped,
    quotaBlocked,
  };
}
