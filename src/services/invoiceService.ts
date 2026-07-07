import { createBrowserClient } from "@/services/supabase/client";
import { INVOICE_SELECT } from "@/services/invoiceFields";
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
    .select(INVOICE_SELECT)
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
    slip_rejection_note: data.slip_rejection_note
      ? String(data.slip_rejection_note)
      : null,
  };
}

export async function saveInvoice(invoice: Invoice): Promise<Invoice> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert(invoice)
    .select(INVOICE_SELECT)
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
    slip_rejection_note: data.slip_rejection_note
      ? String(data.slip_rejection_note)
      : null,
  };
}
