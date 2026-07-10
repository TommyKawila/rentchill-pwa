import { createBrowserClient } from "@/services/supabase/client";
import { INVOICE_SELECT, mapInvoiceRow } from "@/services/invoiceFields";
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
  return mapInvoiceRow(data);
}

export async function getTenantInvoiceHistory(
  tenantId: string,
  limit = 12,
): Promise<Invoice[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .eq("tenant_id", tenantId)
    .order("billing_month", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapInvoiceRow);
}

export async function saveInvoice(invoice: Invoice): Promise<Invoice> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert(invoice)
    .select(INVOICE_SELECT)
    .single();

  if (error) throw error;

  return mapInvoiceRow(data);
}
