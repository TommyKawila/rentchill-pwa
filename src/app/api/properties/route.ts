import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import { listOwnerProperties } from "@/services/ownerPropertyService";

export async function GET(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const properties = await listOwnerProperties(auth.ownerId);
    return NextResponse.json({ ok: true, properties });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดหอพักไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
