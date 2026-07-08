import { NextResponse } from "next/server";
import { approvePlatformPayment } from "@/services/platformPaymentService";
import { requireSuperadmin } from "@/services/superadminGuard";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    await approvePlatformPayment(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "อนุมัติไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
