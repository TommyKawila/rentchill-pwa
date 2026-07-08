import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { sendPaymentReminder } from "@/services/reminderService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property_slug?: string;
      tenant_id?: string;
    };

    if (!body.property_slug || !body.tenant_id) {
      return NextResponse.json(
        { error: "ต้องระบุ property_slug และ tenant_id" },
        { status: 400 },
      );
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await sendPaymentReminder(body.property_slug, body.tenant_id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "QUOTA_EXCEEDED", message: "ใช้โควต้าแจ้งเตือนครบแล้วเดือนนี้" },
        { status: 403 },
      );
    }

    const message = error instanceof Error ? error.message : "ส่งแจ้งเตือนไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
