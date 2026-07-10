import { NextResponse } from "next/server";
import {
  getTenantDeposit,
  upsertTenantDeposit,
  type DepositStatus,
} from "@/services/depositService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

function parseStatus(value: unknown): DepositStatus | null {
  if (
    value === "held" ||
    value === "refunded" ||
    value === "partial_refund" ||
    value === "forfeited"
  ) {
    return value;
  }
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const tenantId = new URL(request.url).searchParams.get("tenant_id");
    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }

    const deposit = await getTenantDeposit({ propertySlug: slug, roomId, tenantId });
    return NextResponse.json({ ok: true, deposit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as {
      tenant_id?: string;
      amount?: number;
      status?: string;
      note?: string | null;
    };

    const tenantId = body.tenant_id;
    const status = parseStatus(body.status);
    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }
    if (status === null) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
    }

    const deposit = await upsertTenantDeposit({
      propertySlug: slug,
      roomId,
      tenantId,
      amount: Number(body.amount ?? 0),
      status,
      note: body.note,
      ownerId: auth.ownerId,
    });

    return NextResponse.json({ ok: true, deposit });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
    const status = raw === "PLAN_DEPOSIT" ? 403 : 400;
    return NextResponse.json(
      { error: raw === "PLAN_DEPOSIT" ? "แผน Pro เท่านั้น" : raw },
      { status },
    );
  }
}
