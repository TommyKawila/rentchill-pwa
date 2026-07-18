import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import { getOwnerProfile } from "@/services/ownerProfileService";

export async function GET(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const profile = await getOwnerProfile(auth.ownerId);
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[owner.profile.GET]", {}, error);
    const message =
      error instanceof Error ? error.message : "โหลดโปรไฟล์ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
