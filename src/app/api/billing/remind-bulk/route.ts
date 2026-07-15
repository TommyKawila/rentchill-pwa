import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { sendPaymentReminderBulk } from "@/services/reminderService";
import type { ReminderTier } from "@/services/paymentReminderTier";

function parseTier(value: unknown): ReminderTier | null {
  if (value === "soft" || value === "firm" || value === "final") return value;
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property_slug?: string;
      tier?: string;
    };

    if (!body.property_slug) {
      return NextResponse.json(
        { error: "ต้องระบุ property_slug" },
        { status: 400 },
      );
    }

    const tier = parseTier(body.tier);
    if (!tier) {
      return NextResponse.json(
        { error: "ต้องระบุ tier เป็น soft, firm หรือ final" },
        { status: 400 },
      );
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await sendPaymentReminderBulk(body.property_slug, tier);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "QUOTA_EXCEEDED", message: "โควต้า LINE หมดแล้วเดือนนี้" },
        { status: 403 },
      );
    }

    console.error("[billing.remind-bulk.POST]", {}, error);
    const message = error instanceof Error ? error.message : "ส่งทวงบิลไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
