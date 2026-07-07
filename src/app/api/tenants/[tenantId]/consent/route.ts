import { NextResponse } from "next/server";
import { recordPdpaConsent } from "@/services/pdpaService";

export async function POST(
  _request: Request,
  context: { params: Promise<{ tenantId: string }> },
) {
  try {
    const { tenantId } = await context.params;
    await recordPdpaConsent(tenantId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Consent failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
