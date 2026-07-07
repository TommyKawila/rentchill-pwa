import { NextResponse } from "next/server";
import { linkTenantByInviteCode } from "@/services/tenantLinkService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      invite_code?: string;
      line_user_id?: string;
    };

    if (!body.invite_code?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกรหัสเชิญ" }, { status: 400 });
    }

    if (!body.line_user_id?.trim()) {
      return NextResponse.json({ error: "ไม่พบ LINE User ID" }, { status: 400 });
    }

    const result = await linkTenantByInviteCode(
      body.invite_code,
      body.line_user_id,
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ผูกห้องไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
