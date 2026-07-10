import { NextResponse } from "next/server";
import { signLeaseContract } from "@/services/contractService";
import { uploadTenantDocument } from "@/services/documentVaultService";
import type { DocumentType } from "@/services/planLimits";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function parseDocType(value: FormDataEntryValue | null): DocumentType | null {
  if (value === "id_card" || value === "passport") return value;
  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "upload");
    const tenantId = String(formData.get("tenant_id") ?? "");
    const file = formData.get("file");

    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    if (action === "sign") {
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "กรุณาวาดลายเซ็น" }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "ลายเซ็นไม่ถูกต้อง" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
      }

      const result = await signLeaseContract({ tenantId, signatureFile: file });
      return NextResponse.json({ ok: true, ...result });
    }

    const docType = parseDocType(formData.get("doc_type"));
    const propertySlug = String(formData.get("property_slug") ?? "");
    const roomId = String(formData.get("room_id") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    }
    if (!docType || !propertySlug || !roomId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "รองรับเฉพาะรูปหรือ PDF" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
    }

    const document = await uploadTenantDocument({
      propertySlug,
      roomId,
      tenantId,
      docType,
      file,
      uploadedBy: "tenant",
    });

    return NextResponse.json({ ok: true, document });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "ดำเนินการไม่สำเร็จ";
    const message =
      raw === "PLAN_DOCUMENT_VAULT"
        ? "แผนนี้ไม่รองรับการอัปโหลดเอกสาร"
        : raw === "PLAN_ESIGN"
          ? "แผนนี้ไม่รองรับการเซ็นสัญญา"
          : raw === "NO_LEASE"
            ? "ยังไม่มีสัญญาให้เซ็น"
            : raw === "ALREADY_SIGNED"
              ? "เซ็นสัญญาแล้ว"
              : raw;
    const status =
      raw === "PLAN_DOCUMENT_VAULT" || raw === "PLAN_ESIGN" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
