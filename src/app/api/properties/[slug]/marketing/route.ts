import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import {
  getPropertyMarketingBySlug,
  updatePropertyMarketing,
} from "@/services/propertyMarketingService";
import type { PropertyMarketingInput } from "@/services/propertyMarketingService";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const marketing = await getPropertyMarketingBySlug(slug);
    if (!marketing) {
      return NextResponse.json({ error: "ไม่พบหอพัก" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, marketing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as PropertyMarketingInput;
    const marketing = await updatePropertyMarketing(slug, body);
    return NextResponse.json({ ok: true, marketing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
