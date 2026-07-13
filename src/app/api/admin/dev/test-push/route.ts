import { NextResponse } from "next/server";
import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import { sendTestLinePush } from "@/services/devLineTestService";
import type { LinePushType } from "@/services/linePushQuotaService";
import { requireSuperadmin } from "@/services/superadminGuard";

function devForbidden() {
  return NextResponse.json({ error: "Dev tools disabled" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;
    assertDevToolsEnabled();

    const body = (await request.json()) as {
      line_user_id?: string;
      message_type?: LinePushType;
      property_slug?: string;
    };

    const result = await sendTestLinePush({
      line_user_id: body.line_user_id ?? "",
      message_type: body.message_type ?? "bill_issued",
      property_slug: body.property_slug,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "DEV_TOOLS_DISABLED") {
      return devForbidden();
    }
    const message = error instanceof Error ? error.message : "ส่งทดสอบไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
