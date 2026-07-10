import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT, mapInvoiceRow } from "@/services/invoiceFields";
import { safeNotifyOwnerSlipSubmitted } from "@/services/notificationService";
import { markInvoiceSlipRejected } from "@/services/invoiceRejectService";
import { verifyInvoiceSlip } from "@/services/slipVerificationApplyService";
import { canAutoVerifySlip } from "@/services/planLimits";
import { getPlanTierForPropertyId } from "@/services/ownerQuotaService";
import type { Invoice } from "@/services/types";

const SLIP_BUCKET = "slips";

function mapInvoice(row: Record<string, unknown>): Invoice {
  return mapInvoiceRow(row);
}

export type PaymentSubmitResult = {
  invoice: Invoice;
  verification: {
    verified: boolean;
    message: string;
    transRef: string | null;
  } | null;
  manual_review_reason?: "PLAN_STARTER" | null;
};

export async function submitPaymentSlip(
  invoiceId: string,
  tenantId: string,
  file: File,
): Promise<PaymentSubmitResult> {
  const supabase = createAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("invoices")
    .select("id, tenant_id, status")
    .eq("id", invoiceId)
    .single();

  if (readError || !existing) throw new Error("ไม่พบบิล");
  if (existing.tenant_id !== tenantId) throw new Error("ไม่มีสิทธิ์ชำระบิลนี้");
  if (existing.status === "paid") throw new Error("บิลนี้ชำระแล้ว");
  if (existing.status === "scanning") throw new Error("กำลังตรวจสอบสลิปอยู่แล้ว");

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
      slip_rejection_note: null,
    })
    .eq("id", invoiceId)
    .select(INVOICE_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "อัปเดตบิลไม่สำเร็จ");
  const invoice = mapInvoice(data);

  void safeNotifyOwnerSlipSubmitted(invoice.id);

  const planTier = await getPlanTierForPropertyId(invoice.property_id);
  const autoVerifyEnabled =
    Boolean(process.env.EASYSLIP_API_KEY) && canAutoVerifySlip(planTier);

  if (autoVerifyEnabled) {
    try {
      const outcome = await verifyInvoiceSlip(invoiceId);

      if (!outcome.verification.verified) {
        const rejected = await markInvoiceSlipRejected(
          invoiceId,
          outcome.verification.message,
        );

        return {
          invoice: rejected,
          verification: outcome.verification,
        };
      }

      return {
        invoice: outcome.invoice,
        verification: outcome.verification,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ตรวจสอบสลิปไม่สำเร็จ";
      const rejected = await markInvoiceSlipRejected(invoiceId, message);

      return {
        invoice: rejected,
        verification: { verified: false, message, transRef: null },
      };
    }
  }

  return {
    invoice,
    verification: null,
    manual_review_reason: !canAutoVerifySlip(planTier) ? "PLAN_STARTER" : null,
  };
}
