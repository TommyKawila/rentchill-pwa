import { NextResponse } from "next/server";
import { requireOwnerInvoice } from "@/services/ownerApiGuard";
import { verifyInvoiceSlip } from "@/services/slipVerificationApplyService";

export async function POST(
  request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await context.params;
    const auth = await requireOwnerInvoice(request, invoiceId);
    if ("error" in auth) return auth.error;

    if (!process.env.EASYSLIP_API_KEY) {
      return NextResponse.json(
        { error: "EASYSLIP_API_KEY not configured" },
        { status: 503 },
      );
    }

    const outcome = await verifyInvoiceSlip(invoiceId, { trigger: "owner_verify" });
    return NextResponse.json({ ok: true, ...outcome });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    if (message === "SLIP_VERIFY_PLAN_REQUIRED") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
