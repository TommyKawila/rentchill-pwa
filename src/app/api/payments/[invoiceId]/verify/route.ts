import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAdminCookieName,
  isValidAdminSession,
} from "@/services/adminAuth";
import { verifyInvoiceSlip } from "@/services/slipVerificationApplyService";

export async function POST(
  _request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    const token = (await cookies()).get(getAdminCookieName())?.value;
    const isAdmin = await isValidAdminSession(adminSecret, token);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.EASYSLIP_API_KEY) {
      return NextResponse.json(
        { error: "EASYSLIP_API_KEY not configured" },
        { status: 503 },
      );
    }

    const { invoiceId } = await context.params;
    const outcome = await verifyInvoiceSlip(invoiceId);
    return NextResponse.json({ ok: true, ...outcome });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
