import { NextResponse } from "next/server";
import { uploadOwnerPaymentProof } from "@/services/invoiceOverrideService";
import { requireOwnerInvoice } from "@/services/ownerApiGuard";

export async function POST(
  request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await context.params;
    const auth = await requireOwnerInvoice(request, invoiceId);
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ error: "ไม่พบไฟล์รูป" }, { status: 400 });
    }

    const proofUrl = await uploadOwnerPaymentProof(invoiceId, file);
    return NextResponse.json({ ok: true, proof_url: proofUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "อัปโหลดหลักฐานไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
