import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { getPropertyQuota } from "@/services/propertyQuotaService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertySlug = searchParams.get("property_slug");

    if (!propertySlug) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, propertySlug);
    if ("error" in auth) return auth.error;

    const quota = await getPropertyQuota(propertySlug);
    return NextResponse.json({ ok: true, quota });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดโควต้าไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
