import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { getPropertyPlanUsage } from "@/services/planTierService";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const plan = await getPropertyPlanUsage(slug);
    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดแผนไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
