import { NextResponse } from "next/server";
import {
  linkOwnerLineUserId,
  verifyOwnerLineConnectToken,
} from "@/services/ownerLineConnectService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      line_user_id?: string;
    };

    if (!body.token?.trim() || !body.line_user_id?.trim()) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const verified = await verifyOwnerLineConnectToken(body.token.trim());
    if (!verified) {
      return NextResponse.json(
        { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง — กลับไปสร้างใหม่ที่ตั้งค่า" },
        { status: 400 },
      );
    }

    await linkOwnerLineUserId(
      verified.propertySlug,
      verified.ownerId,
      body.line_user_id.trim(),
    );

    return NextResponse.json({
      ok: true,
      property_slug: verified.propertySlug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เชื่อมต่อไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
