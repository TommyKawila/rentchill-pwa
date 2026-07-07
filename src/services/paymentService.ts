import { createAdminClient } from "@/services/supabase/admin";
import type { Invoice } from "@/services/types";

const SLIP_BUCKET = "slips";

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
  };
}

export async function submitPaymentSlip(
  invoiceId: string,
  tenantId: string,
  file: File,
) {
  const supabase = createAdminClient();

  const { data: invoice, error: readError } = await supabase
    .from("invoices")
    .select("id, tenant_id, status")
    .eq("id", invoiceId)
    .single();

  if (readError || !invoice) throw new Error("ไม่พบบิล");
  if (invoice.tenant_id !== tenantId) throw new Error("ไม่มีสิทธิ์ชำระบิลนี้");
  if (invoice.status === "paid") throw new Error("บิลนี้ชำระแล้ว");
  if (invoice.status === "scanning") throw new Error("กำลังตรวจสอบสลิปอยู่แล้ว");

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${invoiceId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(SLIP_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "scanning",
      slip_image_url: publicUrl.publicUrl,
    })
    .eq("id", invoiceId)
    .select(
      "id, property_id, tenant_id, room_id, billing_month, water_unit, electric_unit, base_rent_amount, water_amount, electric_amount, total_amount, status, slip_image_url",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "อัปเดตบิลไม่สำเร็จ");
  return mapInvoice(data);
}
