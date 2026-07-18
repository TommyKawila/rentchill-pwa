import { NextResponse } from "next/server";
import {
  countWaitingMaintenanceTickets,
  listPropertyMaintenanceTickets,
  updateMaintenanceTicket,
} from "@/services/maintenanceTicketService";
import { jsonFromPlanGate } from "@/services/planGateApi";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import type { MaintenanceTicketStatus } from "@/services/types";

const VALID_STATUSES = new Set<MaintenanceTicketStatus>([
  "waiting",
  "in_progress",
  "done",
]);

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const url = new URL(request.url);
    const countOnly = url.searchParams.get("count") === "waiting";

    if (countOnly) {
      const count = await countWaitingMaintenanceTickets(slug);
      return NextResponse.json({ ok: true, count });
    }

    const tickets = await listPropertyMaintenanceTickets(slug);
    return NextResponse.json({ ok: true, tickets });
  } catch (error) {
    const gate = jsonFromPlanGate(error);
    if (gate) return gate;
    console.error("[properties.maintenance.GET]", {}, error);
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as {
      ticket_id?: string;
      status?: MaintenanceTicketStatus;
      technician_name?: string | null;
      technician_phone?: string | null;
      expense_amount?: number | null;
    };

    if (!body.ticket_id) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    if (body.status && !VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
    }

    const ticket = await updateMaintenanceTicket({
      propertySlug: slug,
      ticketId: body.ticket_id,
      status: body.status,
      technician_name: body.technician_name,
      technician_phone: body.technician_phone,
      expense_amount: body.expense_amount,
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    const gate = jsonFromPlanGate(error);
    if (gate) return gate;
    console.error("[properties.maintenance.PATCH]", {}, error);
    const message = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
