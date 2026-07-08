import { createAdminClient } from "@/services/supabase/admin";
import { INVOICE_SELECT } from "@/services/invoiceFields";
import { safeNotifyPaymentConfirmed } from "@/services/notificationService";
import { matchSlipReceiver } from "@/services/slipAccountMatchService";
import { getPropertyPaymentById } from "@/services/propertyPaymentService";
import { verifySlipByUrl } from "@/services/slipVerificationService";
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
