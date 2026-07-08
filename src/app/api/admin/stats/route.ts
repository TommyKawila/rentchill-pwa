import { NextResponse } from "next/server";
import { getPlatformStats } from "@/services/platformStatsService";
import { requireSuperadmin } from "@/services/superadminGuard";

export async function GET(request: Request) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;

    const stats = await getPlatformStats();
    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดสถิติไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
