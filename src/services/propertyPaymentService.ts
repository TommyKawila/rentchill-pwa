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
  };
}

const paymentSelect =
  "id, name, slug, payment_prompt_pay, payment_bank_account, payment_receiver_name";

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
    })
    .eq("slug", slug)
    .select(paymentSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "อัปเดตบัญชีรับเงินไม่สำเร็จ");
  }

  return mapPaymentAccount(data);
}
