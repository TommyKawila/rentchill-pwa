import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT } from "@/services/invoiceFields";
import { safeNotifySlipRejected } from "@/services/notificationService";
import type { Invoice } from "@/services/types";

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
    status: row.status as Invoice["status"],
    slip_image_url: row.slip_image_url ? String(row.slip_image_url) : null,
    slip_rejection_note: row.slip_rejection_note
      ? String(row.slip_rejection_note)
      : null,
  };
}

export async function markInvoiceSlipRejected(
  invoiceId: string,
  note: string,
  options?: { clearSlip?: boolean },
) {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {
    status: "pending",
    slip_rejection_note: note,
  };

  if (options?.clearSlip) {
    update.slip_image_url = null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(update)
    .eq("id", invoiceId)
    .select(INVOICE_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "อัปเดตบิลไม่สำเร็จ");
  }

  const invoice = mapInvoice(data);
  void notifySlipRejected(invoice, note);

  return invoice;
}

async function notifySlipRejected(invoice: Invoice, note: string) {
  const supabase = createAdminClient();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("line_user_id, rooms(room_number)")
    .eq("id", invoice.tenant_id)
    .maybeSingle();

  if (error || !tenant?.line_user_id) return;

  const roomRaw = tenant.rooms as { room_number: string } | { room_number: string }[] | null;
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

  await safeNotifySlipRejected({
    lineUserId: String(tenant.line_user_id),
    roomNumber: room?.room_number ?? "-",
    billingMonth: invoice.billing_month,
    note,
  });
}
