import {
  clampBillingDay,
  clampReminderDays,
  clampUtilityRate,
} from "@/services/propertyBillingSettingsService";
import {
  DEFAULT_REMINDER_DAYS,
  normalizeReminderDaySettings,
} from "@/services/paymentReminderTier";
import { sanitizeReminderTemplate } from "@/services/paymentReminderMessageService";
import {
  DEFAULT_REMINDER_PRESET,
  detectReminderPreset,
  parseReminderPreset,
} from "@/services/reminderPresetService";
import { createAdminClient } from "@/services/supabase/admin";
import { createServerClient } from "@/services/supabase/server";
import { normalizeTechnicianContacts } from "@/services/settingsSummaryService";
import { normalizeLineChatUrl } from "@/services/technicianLineService";
import type {
  PropertyPaymentAccount,
  PropertyPaymentInput,
  TechnicianContacts,
} from "@/services/types";

function sanitizeTechnicianContacts(
  input: TechnicianContacts,
): TechnicianContacts {
  const result: TechnicianContacts = {};
  for (const dept of ["electrical", "plumbing", "internet"] as const) {
    const entry = input[dept];
    if (!entry) continue;
    const phone = entry.phone?.trim() || null;
    const line_url = normalizeLineChatUrl(entry.line_url);
    const display_name = entry.display_name?.trim() || null;
    if (phone || line_url || display_name) {
      result[dept] = { phone, line_url, display_name };
    }
  }
  return result;
}

function mapPaymentAccount(row: Record<string, unknown>): PropertyPaymentAccount {
  const reminder = normalizeReminderDaySettings({
    soft: Number(row.reminder_soft_days ?? DEFAULT_REMINDER_DAYS.soft),
    firm: Number(row.reminder_firm_days ?? DEFAULT_REMINDER_DAYS.firm),
    final: Number(row.reminder_final_days ?? DEFAULT_REMINDER_DAYS.final),
  });

  return {
    property_id: String(row.id),
    property_name: String(row.name),
    property_slug: String(row.slug),
    prompt_pay: row.payment_prompt_pay ? String(row.payment_prompt_pay) : null,
    bank_account: row.payment_bank_account ? String(row.payment_bank_account) : null,
    receiver_name: row.payment_receiver_name ? String(row.payment_receiver_name) : null,
    contact_line_url: row.contact_line_url ? String(row.contact_line_url) : null,
    contact_line_qr_url: row.contact_line_qr_url ? String(row.contact_line_qr_url) : null,
    contact_phone: row.contact_phone ? String(row.contact_phone) : null,
    technician_phone: row.technician_phone ? String(row.technician_phone) : null,
    technician_contacts: normalizeTechnicianContacts(
      row.technician_contacts,
      row.technician_phone ? String(row.technician_phone) : null,
    ),
    owner_line_user_id: row.owner_line_user_id ? String(row.owner_line_user_id) : null,
    billing_day: Number(row.billing_day ?? 1),
    meter_reminder_days_before: Number(row.meter_reminder_days_before ?? 3),
    reminder_preset: parseReminderPreset(
      row.reminder_preset ? String(row.reminder_preset) : DEFAULT_REMINDER_PRESET,
      reminder,
    ),
    reminder_soft_days: reminder.soft,
    reminder_firm_days: reminder.firm,
    reminder_final_days: reminder.final,
    reminder_template_soft: row.reminder_template_soft
      ? String(row.reminder_template_soft)
      : null,
    reminder_template_firm: row.reminder_template_firm
      ? String(row.reminder_template_firm)
      : null,
    reminder_template_final: row.reminder_template_final
      ? String(row.reminder_template_final)
      : null,
    include_utilities: row.include_utilities !== false,
    water_rate_per_unit: Number(row.water_rate_per_unit ?? 10),
    electric_rate_per_unit: Number(row.electric_rate_per_unit ?? 7),
  };
}

const paymentSelect =
  "id, name, slug, payment_prompt_pay, payment_bank_account, payment_receiver_name, contact_line_url, contact_line_qr_url, contact_phone, technician_phone, technician_contacts, owner_line_user_id, billing_day, meter_reminder_days_before, reminder_preset, reminder_soft_days, reminder_firm_days, reminder_final_days, reminder_template_soft, reminder_template_firm, reminder_template_final, include_utilities, water_rate_per_unit, electric_rate_per_unit";

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
      ...(input.prompt_pay !== undefined
        ? { payment_prompt_pay: input.prompt_pay?.trim() || null }
        : {}),
      ...(input.bank_account !== undefined
        ? { payment_bank_account: input.bank_account?.trim() || null }
        : {}),
      ...(input.receiver_name !== undefined
        ? { payment_receiver_name: input.receiver_name?.trim() || null }
        : {}),
      ...(input.contact_line_url !== undefined
        ? { contact_line_url: input.contact_line_url?.trim() || null }
        : {}),
      ...(input.contact_line_qr_url !== undefined
        ? { contact_line_qr_url: input.contact_line_qr_url?.trim() || null }
        : {}),
      ...(input.contact_phone !== undefined
        ? { contact_phone: input.contact_phone?.trim() || null }
        : {}),
      ...(input.technician_phone !== undefined
        ? { technician_phone: input.technician_phone?.trim() || null }
        : {}),
      ...(input.technician_contacts !== undefined
        ? {
            technician_contacts: sanitizeTechnicianContacts(
              input.technician_contacts,
            ),
          }
        : {}),
      ...(input.owner_line_user_id !== undefined
        ? { owner_line_user_id: input.owner_line_user_id?.trim() || null }
        : {}),
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
      ...((input.reminder_soft_days !== undefined ||
        input.reminder_firm_days !== undefined ||
        input.reminder_final_days !== undefined ||
        input.reminder_preset !== undefined)
        ? (() => {
            const reminder = normalizeReminderDaySettings({
              soft:
                input.reminder_soft_days ??
                DEFAULT_REMINDER_DAYS.soft,
              firm:
                input.reminder_firm_days ??
                DEFAULT_REMINDER_DAYS.firm,
              final:
                input.reminder_final_days ??
                DEFAULT_REMINDER_DAYS.final,
            });
            return {
              reminder_preset: detectReminderPreset(reminder),
              reminder_soft_days: reminder.soft,
              reminder_firm_days: reminder.firm,
              reminder_final_days: reminder.final,
            };
          })()
        : {}),
      ...(input.reminder_template_soft !== undefined
        ? {
            reminder_template_soft: sanitizeReminderTemplate(
              "soft",
              input.reminder_template_soft,
            ),
          }
        : {}),
      ...(input.reminder_template_firm !== undefined
        ? {
            reminder_template_firm: sanitizeReminderTemplate(
              "firm",
              input.reminder_template_firm,
            ),
          }
        : {}),
      ...(input.reminder_template_final !== undefined
        ? {
            reminder_template_final: sanitizeReminderTemplate(
              "final",
              input.reminder_template_final,
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
