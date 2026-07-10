import { NextResponse } from "next/server";
import {
  deleteTenantDocument,
  listTenantDocuments,
  uploadTenantDocument,
  type TenantDocumentRow,
} from "@/services/documentVaultService";
import type { DocumentType } from "@/services/planLimits";
import { logAuditForSlug } from "@/services/auditLogService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

function parseDocType(value: FormDataEntryValue | null): DocumentType | null {
  const allowed = [
    "id_card",
    "passport",
    "lease",
    "contract_signed",
    "move_in",
    "move_out",
    "deposit_receipt",
  ] as const;
  if (typeof value !== "string") return null;
  return (allowed as readonly string[]).includes(value)
    ? (value as DocumentType)
    : null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const tenantId = new URL(request.url).searchParams.get("tenant_id");
    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    const documents = await listTenantDocuments({
      propertySlug: slug,
      roomId,
      tenantId,
    });

    return NextResponse.json({ ok: true, documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดเอกสารไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    const docType = parseDocType(formData.get("doc_type"));
    const tenantId = String(formData.get("tenant_id") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    }
    if (!docType) {
      return NextResponse.json({ error: "ประเภทเอกสารไม่ถูกต้อง" }, { status: 400 });
    }
    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    const document: TenantDocumentRow = await uploadTenantDocument({
      propertySlug: slug,
      roomId,
      tenantId,
      docType,
      file,
      uploadedBy: "owner",
    });

    await logAuditForSlug({
      propertySlug: slug,
      roomId,
      tenantId,
      actorType: "owner",
      actorId: auth.ownerId,
      action: "document.upload",
      detail: { doc_type: docType },
    });

    return NextResponse.json({ ok: true, document });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ";
    const message =
      raw === "PLAN_DOCUMENT_VAULT"
        ? "แผนนี้ไม่รองรับคลังเอกสาร"
        : raw === "PLAN_DOC_TYPE"
          ? "แผนนี้ไม่รองรับประเภทเอกสารนี้"
          : raw === "DOC_LIMIT"
            ? "เกินจำนวนเอกสารของแผน"
            : raw === "FILE_TOO_LARGE"
              ? "ไฟล์ใหญ่เกิน 5MB"
              : raw;
    const status = raw === "PLAN_DOCUMENT_VAULT" || raw === "PLAN_DOC_TYPE" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
