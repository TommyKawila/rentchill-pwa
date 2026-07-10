import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT, mapInvoiceRow } from "@/services/invoiceFields";
import { safeNotifyPaymentConfirmed } from "@/services/notificationService";
import { matchSlipReceiver } from "@/services/slipAccountMatchService";
import { getPropertyPaymentById } from "@/services/propertyPaymentService";
import { verifySlipByUrl } from "@/services/slipVerificationService";
import { canAutoVerifySlip } from "@/services/planLimits";
import { getPlanTierForPropertyId } from "@/services/ownerQuotaService";
import type { Invoice } from "@/services/types";

function mapInvoice(row: Record<string, unknown>): Invoice {
  return mapInvoiceRow(row);
}

const invoiceSelect = INVOICE_SELECT;

export type SlipVerificationOutcome = {
  invoice: Invoice;
  verification: {
    verified: boolean;
    message: string;
    transRef: string | null;
  };
};

export async function verifyInvoiceSlip(
  invoiceId: string,
): Promise<SlipVerificationOutcome> {
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) throw new Error("ไม่พบบิล");

  const mapped = mapInvoice(invoice);

  if (!mapped.slip_image_url) {
    throw new Error("ไม่พบสลิป");
  }

  if (mapped.status === "paid") {
    return {
      invoice: mapped,
      verification: {
        verified: true,
        message: "ชำระแล้ว",
        transRef: null,
      },
    };
  }

  const planTier = await getPlanTierForPropertyId(mapped.property_id);
  if (!canAutoVerifySlip(planTier)) {
    throw new Error("SLIP_VERIFY_PLAN_REQUIRED");
  }

  const result = await verifySlipByUrl(
    mapped.slip_image_url,
    mapped.total_amount,
    `rentchill-${invoiceId}`,
  );

  if (!result.verified) {
    return {
      invoice: mapped,
      verification: {
        verified: false,
        message: result.message,
        transRef: result.transRef,
      },
    };
  }

  const paymentAccount = await getPropertyPaymentById(mapped.property_id);
  if (paymentAccount && result.receiver) {
    const accountMatch = matchSlipReceiver(paymentAccount, result.receiver);
    if (!accountMatch.matched) {
      return {
        invoice: mapped,
        verification: {
          verified: false,
          message: accountMatch.message,
          transRef: result.transRef,
        },
      };
    }
  }

  const { data: paid, error: updateError } = await supabase
    .from("invoices")
    .update({ status: "paid" })
    .eq("id", invoiceId)
    .select(invoiceSelect)
    .single();

  if (updateError || !paid) {
    throw new Error(updateError?.message ?? "อัปเดตบิลไม่สำเร็จ");
  }

  void safeNotifyPaymentConfirmed(invoiceId);

  return {
    invoice: mapInvoice(paid),
    verification: {
      verified: true,
      message: result.message,
      transRef: result.transRef,
    },
  };
}
