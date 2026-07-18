import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT, mapInvoiceRow } from "@/services/invoiceFields";
import { safeNotifySlipRejected } from "@/services/notificationService";
import type { Invoice } from "@/services/types";

function mapInvoice(row: Record<string, unknown>): Invoice {
  return mapInvoiceRow(row);
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
    slip_submitted_at: null,
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
    .select("line_user_id, rooms(room_number, property_id, properties(slug))")
    .eq("id", invoice.tenant_id)
    .maybeSingle();

  if (error || !tenant?.line_user_id) return;

  const roomRaw = tenant.rooms as
    | { room_number: string; properties: { slug: string } | { slug: string }[] | null }
    | { room_number: string; properties: { slug: string } | { slug: string }[] | null }[]
    | null;
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
  const propertyRaw = room?.properties;
  const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
  if (!property?.slug) return;

  await safeNotifySlipRejected({
    propertySlug: property.slug,
    lineUserId: String(tenant.line_user_id),
    roomNumber: room?.room_number ?? "-",
    billingMonth: invoice.billing_month,
    note,
  });
}
