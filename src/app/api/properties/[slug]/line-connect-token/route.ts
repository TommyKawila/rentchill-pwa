import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { createOwnerLineConnectToken } from "@/services/ownerLineConnectService";
import { buildOwnerLineConnectLiffUrl } from "@/services/line/liffUrls";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const token = await createOwnerLineConnectToken(auth.ownerId, slug);
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      return NextResponse.json(
        { error: "LINE ยังไม่พร้อมใช้งาน" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      token,
      liff_url: buildOwnerLineConnectLiffUrl(liffId, slug, token),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "สร้างลิงก์ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
