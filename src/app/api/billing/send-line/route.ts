import { NextResponse } from "next/server";
import { sendInvoiceLineBill } from "@/services/billSendLineService";
import { jsonFromPlanGate } from "@/services/planGateApi";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property_slug?: string;
      tenant_id?: string;
      billing_month?: string;
    };

    if (!body.property_slug || !body.tenant_id || !body.billing_month) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await sendInvoiceLineBill({
      propertySlug: body.property_slug,
      tenantId: body.tenant_id,
      billingMonth: body.billing_month,
      ownerId: auth.ownerId,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const gate = jsonFromPlanGate(error);
    if (gate) return gate;
    console.error("[billing.send-line.POST]", {}, error);
    const message = error instanceof Error ? error.message : "ส่งบิลไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
