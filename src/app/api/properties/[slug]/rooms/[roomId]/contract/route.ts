import { NextResponse } from "next/server";
import { generateLeaseContract, getLeaseContractHtml } from "@/services/contractService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

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

    const result = await getLeaseContractHtml({ propertySlug: slug, roomId, tenantId });
    return NextResponse.json({ ok: true, html: result.html, document: result.document });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "โหลดสัญญาไม่สำเร็จ";
    const status = raw === "PLAN_CONTRACT" || raw === "PLAN_DOCUMENT_VAULT" ? 403 : 400;
    return NextResponse.json({ error: raw }, { status });
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

    const tenantId = new URL(request.url).searchParams.get("tenant_id");
    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    const result = await generateLeaseContract({ propertySlug: slug, roomId, tenantId });
    return NextResponse.json({ ok: true, html: result.html, document: result.document });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "สร้างสัญญาไม่สำเร็จ";
    const status = raw === "PLAN_CONTRACT" ? 403 : 400;
    return NextResponse.json({ error: raw }, { status });
  }
}
