import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { listVacantRooms } from "@/services/vacantRoomService";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const rooms = await listVacantRooms(slug);
    return NextResponse.json({ ok: true, rooms });
  } catch (error) {
    console.error("[properties.vacantRooms.GET]", {}, error);
    const message =
      error instanceof Error ? error.message : "โหลดห้องว่างไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
