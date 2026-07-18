import { createAdminClient } from "@/services/supabase/admin";
import {
  INVOICE_SELECT,
  mapInvoiceRow,
  queryWithInvoiceSelectFallback,
} from "@/services/invoiceFields";
import { markInvoiceSlipRejected } from "@/services/invoiceRejectService";
import { safeNotifyPaymentConfirmed } from "@/services/notificationService";
import { calculateInvoiceAmounts } from "@/services/invoiceCalculator";
import type { Invoice, InvoiceStatus } from "@/services/types";

export type InvoiceOverrideRow = Invoice & {
  tenant_name: string;
  room_number: string;
};

function mapInvoice(row: Record<string, unknown>) {
  return mapInvoiceRow(row);
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

  const { data, error } = await queryWithInvoiceSelectFallback((select) =>
    supabase
      .from("invoices")
      .select(`${select}, tenants(name), rooms(room_number)`)
      .eq("property_id", property.id)
      .in("status", ["pending", "scanning"])
      .order("billing_month", { ascending: false }),
  );

  if (error) throw error;

  return mapOverrideRows((data ?? []) as unknown as Record<string, unknown>[]);
}

function mapOverrideRows(data: Record<string, unknown>[]) {
  return data.map((row) => {
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

async function getPropertyId(propertySlug: string) {
  const supabase = createAdminClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!property) throw new Error("ไม่พบหอพัก");
  return property.id;
}

export async function getPaidInvoicesWithSlips(
  propertySlug: string,
  limit = 12,
): Promise<InvoiceOverrideRow[]> {
  const propertyId = await getPropertyId(propertySlug);
  const supabase = createAdminClient();

  const { data, error } = await queryWithInvoiceSelectFallback((select) =>
    supabase
      .from("invoices")
      .select(`${select}, tenants(name), rooms(room_number)`)
      .eq("property_id", propertyId)
      .eq("status", "paid")
      .order("billing_month", { ascending: false })
      .limit(limit),
  );

  if (error) throw error;
  return mapOverrideRows((data ?? []) as unknown as Record<string, unknown>[]);
}

export async function updateInvoiceMeters(
  invoiceId: string,
  _waterUnit: number,
  _electricUnit: number,
) {
  const supabase = createAdminClient();

  const { data: current, error: readError } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .maybeSingle();

  if (readError || !current) throw new Error("ไม่พบบิล");
  throw new Error("ออกบิลแล้ว — ไม่สามารถแก้มิเตอร์ได้");
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

const SLIP_BUCKET = "slips";

export async function uploadOwnerPaymentProof(
  invoiceId: string,
  file: File,
): Promise<string> {
  const supabase = createAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (readError || !existing) throw new Error("ไม่พบบิล");
  if (existing.status === "paid") throw new Error("บิลนี้ชำระแล้ว");
  if (existing.status !== "pending" && existing.status !== "scanning") {
    throw new Error("ไม่สามารถแนบหลักฐานได้");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${invoiceId}/owner-cash-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error("อัปโหลดหลักฐานไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(SLIP_BUCKET).getPublicUrl(path);
  return publicUrl.publicUrl;
}

export type ApproveInvoiceManualInput = {
  slipImageUrl?: string | null;
  ownerPaymentProofUrl?: string | null;
  ownerPaymentNote?: string | null;
};

export async function approveInvoiceManually(
  invoiceId: string,
  input?: ApproveInvoiceManualInput | string | null,
) {
  const supabase = createAdminClient();
  const options: ApproveInvoiceManualInput =
    typeof input === "string" || input == null
      ? { slipImageUrl: input ?? null }
      : input;

  const note = options.ownerPaymentNote?.trim().slice(0, 200) || null;

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      slip_image_url: options.slipImageUrl ?? null,
      owner_payment_proof_url: options.ownerPaymentProofUrl?.trim() || null,
      owner_payment_note: note,
    })
    .eq("id", invoiceId)
    .select(INVOICE_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "อนุมัติบิลไม่สำเร็จ");
  void safeNotifyPaymentConfirmed(invoiceId);
  return mapInvoice(data);
}

export type InvoiceEvidenceRow = {
  billing_month: string;
  total_amount: number;
  room_number: string;
  tenant_name: string;
  slip_image_url: string | null;
  owner_payment_proof_url: string | null;
  owner_payment_note: string | null;
  slip_rejection_note: string | null;
};

export async function getInvoiceEvidence(
  invoiceId: string,
): Promise<InvoiceEvidenceRow | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(`${INVOICE_SELECT}, tenants(name), rooms(room_number)`)
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const invoice = mapInvoice(data);
  const tenantRaw = data.tenants as { name: string } | { name: string }[] | null;
  const roomRaw = data.rooms as { room_number: string } | { room_number: string }[] | null;
  const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;

  return {
    billing_month: invoice.billing_month,
    total_amount: invoice.total_amount,
    room_number: room?.room_number ?? "-",
    tenant_name: tenant?.name ?? "-",
    slip_image_url: invoice.slip_image_url,
    owner_payment_proof_url: invoice.owner_payment_proof_url,
    owner_payment_note: invoice.owner_payment_note,
    slip_rejection_note: invoice.slip_rejection_note,
  };
}
