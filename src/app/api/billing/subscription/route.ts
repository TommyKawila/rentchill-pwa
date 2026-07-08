import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import {
  getOwnerSubscription,
  getPlatformPaymentAccount,
} from "@/services/platformPaymentService";

export async function GET(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const subscription = await getOwnerSubscription(auth.ownerId);
    const account = getPlatformPaymentAccount();

    return NextResponse.json({ ok: true, subscription, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
