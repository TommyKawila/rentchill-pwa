import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT, mapInvoiceRow } from "@/services/invoiceFields";
import { notifyBillIssued } from "@/services/notificationService";

export async function sendInvoiceLineBill(input: {
  propertySlug: string;
  tenantId: string;
  billingMonth: string;
  ownerId?: string;
}) {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("slug", input.propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data, error } = await supabase
    .from("invoices")
    .select(`${INVOICE_SELECT}, tenants(line_user_id), rooms(room_number)`)
    .eq("property_id", property.id)
    .eq("tenant_id", input.tenantId)
    .eq("billing_month", input.billingMonth)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบบิล");

  const invoice = mapInvoiceRow(data);
  const tenantRaw = data.tenants as
    | { line_user_id: string | null }
    | { line_user_id: string | null }[]
    | null;
  const roomRaw = data.rooms as { room_number: string } | { room_number: string }[] | null;
  const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

  if (!tenant?.line_user_id) {
    return { sent: false as const, reason: "not_linked" as const, invoice };
  }

  const result = await notifyBillIssued({
    propertySlug: input.propertySlug,
    lineUserId: String(tenant.line_user_id),
    roomNumber: room?.room_number ?? "",
    billingMonth: invoice.billing_month,
    totalAmount: invoice.total_amount,
    baseRentAmount: invoice.base_rent_amount,
    waterAmount: invoice.water_amount,
    electricAmount: invoice.electric_amount,
    extraItems: invoice.extra_items,
  });

  return { ...result, invoice };
}
