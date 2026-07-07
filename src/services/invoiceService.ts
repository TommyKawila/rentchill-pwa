import { createBrowserClient } from "@/services/supabase/client";
import type { Invoice } from "@/services/types";

const getBillingMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

export async function getInvoiceForTenantMonth(
  tenantId: string,
  billingMonth = getBillingMonth(),
): Promise<Invoice | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, property_id, tenant_id, room_id, billing_month, water_unit, electric_unit, base_rent_amount, water_amount, electric_amount, total_amount, status, slip_image_url",
    )
    .eq("tenant_id", tenantId)
    .eq("billing_month", billingMonth)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    water_unit: Number(data.water_unit),
    electric_unit: Number(data.electric_unit),
    base_rent_amount: Number(data.base_rent_amount),
    water_amount: Number(data.water_amount),
    electric_amount: Number(data.electric_amount),
    total_amount: Number(data.total_amount),
  };
}

export async function saveInvoice(invoice: Invoice): Promise<Invoice> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert(invoice)
    .select(
      "id, property_id, tenant_id, room_id, billing_month, water_unit, electric_unit, base_rent_amount, water_amount, electric_amount, total_amount, status, slip_image_url",
    )
    .single();

  if (error) throw error;

  return {
    ...data,
    water_unit: Number(data.water_unit),
    electric_unit: Number(data.electric_unit),
    base_rent_amount: Number(data.base_rent_amount),
    water_amount: Number(data.water_amount),
    electric_amount: Number(data.electric_amount),
    total_amount: Number(data.total_amount),
  };
}
