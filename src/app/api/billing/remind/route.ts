import { NextResponse } from "next/server";
import { jsonFromPlanGate } from "@/services/planGateApi";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { sendPaymentReminder } from "@/services/reminderService";
import type { ReminderTier } from "@/services/paymentReminderTier";

function parseTier(value: unknown): ReminderTier | undefined {
  if (value === "soft" || value === "firm" || value === "final") return value;
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property_slug?: string;
      tenant_id?: string;
      tier?: string;
    };

    if (!body.property_slug || !body.tenant_id) {
      return NextResponse.json(
        { error: "ต้องระบุ property_slug และ tenant_id" },
        { status: 400 },
      );
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await sendPaymentReminder(
      body.property_slug,
      body.tenant_id,
      parseTier(body.tier),
      auth.ownerId,
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const gate = jsonFromPlanGate(error);
    if (gate) return gate;
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "QUOTA_EXCEEDED", message: "โควต้า LINE หมดแล้วเดือนนี้" },
        { status: 403 },
      );
    }

    console.error("[billing.remind.POST]", {}, error);
    const message = error instanceof Error ? error.message : "ส่งแจ้งเตือนไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
