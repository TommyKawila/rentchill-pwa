import { NextResponse } from "next/server";
import {
  countWaitingMaintenanceTickets,
  listPropertyMaintenanceTickets,
  updateMaintenanceTicketStatus,
} from "@/services/maintenanceTicketService";
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
    };

    if (!body.ticket_id || !body.status || !VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const ticket = await updateMaintenanceTicketStatus({
      propertySlug: slug,
      ticketId: body.ticket_id,
      status: body.status,
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    const message = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
