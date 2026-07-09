import { NextResponse } from "next/server";
import { uploadContactLineQr } from "@/services/contactQrUploadService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { updatePropertyPayment } from "@/services/propertyPaymentService";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    const url = await uploadContactLineQr(slug, file);
    const account = await updatePropertyPayment(slug, { contact_line_qr_url: url });

    return NextResponse.json({ ok: true, url, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
