import { NextResponse } from "next/server";
import { getInvoiceAuditContext, logAudit } from "@/services/auditLogService";
import {
  approveInvoiceManually,
  rejectInvoiceSlip,
  updateInvoiceMeters,
} from "@/services/invoiceOverrideService";
import { requireOwnerInvoice } from "@/services/ownerApiGuard";

type OverrideBody =
  | {
      action: "update_meters";
      water_unit: number;
      electric_unit: number;
    }
  | {
      action: "approve";
      slip_image_url?: string | null;
    }
  | {
      action: "reject";
      note?: string | null;
    };

async function auditInvoiceAction(
  invoiceId: string,
  ownerId: string,
  action: string,
  detail?: Record<string, unknown>,
) {
  const ctx = await getInvoiceAuditContext(invoiceId);
  if (!ctx) return;
  await logAudit({
    propertyId: ctx.propertyId,
    roomId: ctx.roomId,
    tenantId: ctx.tenantId,
    actorType: "owner",
    actorId: ownerId,
    action,
    detail,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await context.params;
    const auth = await requireOwnerInvoice(request, invoiceId);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as OverrideBody;

    if (body.action === "update_meters") {
      const water = Number(body.water_unit);
      const electric = Number(body.electric_unit);

      if (!Number.isFinite(water) || !Number.isFinite(electric) || water < 0 || electric < 0) {
        return NextResponse.json({ error: "ค่ามิเตอร์ไม่ถูกต้อง" }, { status: 400 });
      }

      const invoice = await updateInvoiceMeters(invoiceId, water, electric);
      await auditInvoiceAction(invoiceId, auth.ownerId, "invoice.meters", {
        water_unit: water,
        electric_unit: electric,
      });
      return NextResponse.json({ ok: true, invoice });
    }

    if (body.action === "approve") {
      const invoice = await approveInvoiceManually(invoiceId, body.slip_image_url);
      await auditInvoiceAction(invoiceId, auth.ownerId, "invoice.approve");
      return NextResponse.json({ ok: true, invoice });
    }

    if (body.action === "reject") {
      const invoice = await rejectInvoiceSlip(invoiceId, body.note);
      await auditInvoiceAction(invoiceId, auth.ownerId, "invoice.reject", {
        note: body.note ?? null,
      });
      return NextResponse.json({ ok: true, invoice });
    }

    return NextResponse.json({ error: "action ไม่รองรับ" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Override failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
