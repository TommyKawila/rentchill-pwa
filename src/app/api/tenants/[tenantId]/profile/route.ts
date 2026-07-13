import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { updateTenantProfile } from "@/services/tenantProfileService";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ tenantId: string }> },
) {
  try {
    const { tenantId } = await context.params;
    const body = (await request.json()) as {
      property_slug?: string;
      tenant_name?: string;
    };

    if (!body.property_slug?.trim()) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await updateTenantProfile(auth.ownerId, {
      property_slug: body.property_slug,
      tenant_id: tenantId,
      tenant_name: body.tenant_name ?? "",
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "TENANT_NAME_REQUIRED") {
      return NextResponse.json(
        { error: "TENANT_NAME_REQUIRED", message: "กรุณากรอกชื่อผู้เช่า" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message =
      error instanceof Error ? error.message : "อัปเดตข้อมูลลูกบ้านไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
