import {
  clampBillingDay,
  clampReminderDays,
  clampUtilityRate,
} from "@/services/propertyBillingSettingsService";
import { createAdminClient } from "@/services/supabase/admin";
import { createServerClient } from "@/services/supabase/server";
import type { PropertyPaymentAccount, PropertyPaymentInput } from "@/services/types";

function mapPaymentAccount(row: Record<string, unknown>): PropertyPaymentAccount {
  return {
    property_id: String(row.id),
    property_name: String(row.name),
    property_slug: String(row.slug),
    prompt_pay: row.payment_prompt_pay ? String(row.payment_prompt_pay) : null,
    bank_account: row.payment_bank_account ? String(row.payment_bank_account) : null,
    receiver_name: row.payment_receiver_name ? String(row.payment_receiver_name) : null,
    contact_line_url: row.contact_line_url ? String(row.contact_line_url) : null,
    contact_phone: row.contact_phone ? String(row.contact_phone) : null,
    owner_line_user_id: row.owner_line_user_id ? String(row.owner_line_user_id) : null,
    billing_day: Number(row.billing_day ?? 1),
    meter_reminder_days_before: Number(row.meter_reminder_days_before ?? 3),
    include_utilities: row.include_utilities !== false,
    water_rate_per_unit: Number(row.water_rate_per_unit ?? 10),
    electric_rate_per_unit: Number(row.electric_rate_per_unit ?? 7),
  };
}

const paymentSelect =
  "id, name, slug, payment_prompt_pay, payment_bank_account, payment_receiver_name, contact_line_url, contact_phone, owner_line_user_id, billing_day, meter_reminder_days_before, include_utilities, water_rate_per_unit, electric_rate_per_unit";

export async function getPropertyPaymentBySlug(
  slug: string,
): Promise<PropertyPaymentAccount | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select(paymentSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPaymentAccount(data) : null;
}

export async function getPropertyPaymentById(
  propertyId: string,
): Promise<PropertyPaymentAccount | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(paymentSelect)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPaymentAccount(data) : null;
}

export async function updatePropertyPayment(
  slug: string,
  input: PropertyPaymentInput,
): Promise<PropertyPaymentAccount> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("properties")
    .update({
      payment_prompt_pay: input.prompt_pay?.trim() || null,
      payment_bank_account: input.bank_account?.trim() || null,
      payment_receiver_name: input.receiver_name?.trim() || null,
      contact_line_url: input.contact_line_url?.trim() || null,
      contact_phone: input.contact_phone?.trim() || null,
      owner_line_user_id: input.owner_line_user_id?.trim() || null,
      ...(input.billing_day !== undefined
        ? { billing_day: clampBillingDay(input.billing_day) }
        : {}),
      ...(input.meter_reminder_days_before !== undefined
        ? {
            meter_reminder_days_before: clampReminderDays(
              input.meter_reminder_days_before,
            ),
          }
        : {}),
      ...(input.include_utilities !== undefined
        ? { include_utilities: input.include_utilities }
        : {}),
      ...(input.water_rate_per_unit !== undefined
        ? { water_rate_per_unit: clampUtilityRate(input.water_rate_per_unit) }
        : {}),
      ...(input.electric_rate_per_unit !== undefined
        ? {
            electric_rate_per_unit: clampUtilityRate(
              input.electric_rate_per_unit,
            ),
          }
        : {}),
    })
    .eq("slug", slug)
    .select(paymentSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "อัปเดตบัญชีรับเงินไม่สำเร็จ");
  }

  return mapPaymentAccount(data);
}
