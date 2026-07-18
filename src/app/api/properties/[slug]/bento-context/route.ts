import { NextResponse } from "next/server";
import { fetchPropertyBentoContext } from "@/services/dashboardBentoContextService";
import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const billingMonth =
      new URL(request.url).searchParams.get("billing_month") ??
      getCurrentBillingMonth();

    const bento = await fetchPropertyBentoContext(slug, billingMonth);
    return NextResponse.json({ ok: true, ...bento });
  } catch (error) {
    console.error("[properties.bentoContext.GET]", {}, error);
    const message =
      error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
