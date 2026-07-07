import { NextResponse } from "next/server";
import { submitPaymentSlip } from "@/services/paymentService";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const tenantId = String(formData.get("tenant_id") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์สลิป" }, { status: 400 });
    }

    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
    }

    const result = await submitPaymentSlip(invoiceId, tenantId, file);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
