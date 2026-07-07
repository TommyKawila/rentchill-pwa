import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT } from "@/services/invoiceFields";
import { markInvoiceSlipRejected } from "@/services/invoiceRejectService";
import { calculateInvoiceAmounts } from "@/services/invoiceCalculator";
import type { Invoice, InvoiceStatus } from "@/services/types";

export type InvoiceOverrideRow = Invoice & {
  tenant_name: string;
  room_number: string;
};

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    property_id: String(row.property_id),
    tenant_id: String(row.tenant_id),
    room_id: String(row.room_id),
    billing_month: String(row.billing_month),
    water_unit: Number(row.water_unit),
    electric_unit: Number(row.electric_unit),
    base_rent_amount: Number(row.base_rent_amount),
    water_amount: Number(row.water_amount),
    electric_amount: Number(row.electric_amount),
    total_amount: Number(row.total_amount),
    status: row.status as InvoiceStatus,
    slip_image_url: row.slip_image_url ? String(row.slip_image_url) : null,
    slip_rejection_note: row.slip_rejection_note
      ? String(row.slip_rejection_note)
      : null,
  };
}

export async function getOverrideInvoices(
  propertySlug: string,
): Promise<InvoiceOverrideRow[]> {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data, error } = await supabase
    .from("invoices")
    .select(`${INVOICE_SELECT}, tenants(name), rooms(room_number)`)
    .eq("property_id", property.id)
    .in("status", ["pending", "scanning"])
    .order("billing_month", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const invoice = mapInvoice(row);
    const tenantRaw = row.tenants as { name: string } | { name: string }[] | null;
    const roomRaw = row.rooms as { room_number: string } | { room_number: string }[] | null;
    const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
    const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

    return {
      ...invoice,
      tenant_name: tenant?.name ?? "-",
      room_number: room?.room_number ?? "-",
    };
  });
}

export async function updateInvoiceMeters(
  invoiceId: string,
  waterUnit: number,
  electricUnit: number,
) {
  const supabase = createAdminClient();

  const { data: current, error: readError } = await supabase
    .from("invoices")
    .select("id, base_rent_amount")
    .eq("id", invoiceId)
    .single();

  if (readError || !current) throw new Error("ไม่พบบิล");

  const amounts = calculateInvoiceAmounts(
    Number(current.base_rent_amount),
    waterUnit,
    electricUnit,
  );

  const { data, error } = await supabase
    .from("invoices")
    .update({
      water_unit: waterUnit,
      electric_unit: electricUnit,
      ...amounts,
    })
    .eq("id", invoiceId)
    .select(INVOICE_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "อัปเดตมิเตอร์ไม่สำเร็จ");
  return mapInvoice(data);
}

export async function rejectInvoiceSlip(
  invoiceId: string,
  note?: string | null,
) {
  return markInvoiceSlipRejected(
    invoiceId,
    note?.trim() || "สลิปไม่ตรงกับยอดแจ้งชำระ กรุณาส่งใหม่",
  );
}

export async function approveInvoiceManually(
  invoiceId: string,
  slipImageUrl?: string | null,
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      slip_image_url: slipImageUrl ?? null,
    })
    .eq("id", invoiceId)
    .select(INVOICE_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "อนุมัติบิลไม่สำเร็จ");
  return mapInvoice(data);
}
