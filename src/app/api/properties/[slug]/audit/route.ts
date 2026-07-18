import { NextResponse } from "next/server";
import { listPropertyAuditLog } from "@/services/auditLogService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const entries = await listPropertyAuditLog(slug);
    return NextResponse.json({ ok: true, entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
