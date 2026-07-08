import { NextResponse } from "next/server";
import { listPendingPlatformPayments } from "@/services/platformPaymentService";
import { requireSuperadmin } from "@/services/superadminGuard";

export async function GET(request: Request) {
  try {
    const auth = requireSuperadmin(request);
    if ("error" in auth) return auth.error;

    const payments = await listPendingPlatformPayments();
    return NextResponse.json({ ok: true, payments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดรายการไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
