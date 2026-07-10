import { NextResponse } from "next/server";
import { logAuditForSlug } from "@/services/auditLogService";
import { deleteTenantDocument } from "@/services/documentVaultService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string; docId: string }> },
) {
  try {
    const { slug, roomId, docId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const tenantId = new URL(request.url).searchParams.get("tenant_id");
    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    await deleteTenantDocument({
      propertySlug: slug,
      roomId,
      tenantId,
      documentId: docId,
    });

    await logAuditForSlug({
      propertySlug: slug,
      roomId,
      tenantId,
      actorType: "owner",
      actorId: auth.ownerId,
      action: "document.delete",
      detail: { document_id: docId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ลบไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
