import { createBrowserClient } from "@/services/supabase/client";
import type { PropertyContact } from "@/services/types";

export async function getPropertyContactById(
  propertyId: string,
): Promise<PropertyContact | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "name, billing_day, contact_line_url, contact_line_qr_url, contact_phone, payment_prompt_pay, payment_bank_account, payment_receiver_name",
    )
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    property_name: data.name ? String(data.name) : null,
    billing_day: Number(data.billing_day ?? 1),
    contact_line_url: data.contact_line_url ? String(data.contact_line_url) : null,
    contact_line_qr_url: data.contact_line_qr_url ? String(data.contact_line_qr_url) : null,
    contact_phone: data.contact_phone ? String(data.contact_phone) : null,
    payment_prompt_pay: data.payment_prompt_pay
      ? String(data.payment_prompt_pay)
      : null,
    payment_bank_account: data.payment_bank_account
      ? String(data.payment_bank_account)
      : null,
    payment_receiver_name: data.payment_receiver_name
      ? String(data.payment_receiver_name)
      : null,
  };
}
