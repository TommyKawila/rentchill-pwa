import { NextResponse } from "next/server";
import { listPropertyAuditLog } from "@/services/auditLogService";
import { canUseAuditLog } from "@/services/planLimits";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const supabase = createAdminClient();
    const { data: property } = await supabase
      .from("properties")
      .select("plan_tier")
      .eq("slug", slug)
      .maybeSingle();

    const tier = String(property?.plan_tier ?? "starter") as PlanTier;
    if (!canUseAuditLog(tier)) {
      return NextResponse.json({ ok: true, entries: [] });
    }

    const entries = await listPropertyAuditLog(slug);
    return NextResponse.json({ ok: true, entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
