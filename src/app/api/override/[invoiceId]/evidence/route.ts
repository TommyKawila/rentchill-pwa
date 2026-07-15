import { NextResponse } from "next/server";
import { getInvoiceEvidence } from "@/services/invoiceOverrideService";
import { requireOwnerInvoice } from "@/services/ownerApiGuard";

export async function GET(
  request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await context.params;
    const auth = await requireOwnerInvoice(request, invoiceId);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const transRef = searchParams.get("trans_ref");

    const evidence = await getInvoiceEvidence(invoiceId);
    if (!evidence) {
      return NextResponse.json({ error: "ไม่พบบิล" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      evidence: {
        ...evidence,
        trans_ref: transRef?.trim() || null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดหลักฐานไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
