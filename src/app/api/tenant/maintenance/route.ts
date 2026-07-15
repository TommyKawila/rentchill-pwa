import { NextResponse } from "next/server";
import {
  listTenantMaintenanceTickets,
  submitMaintenanceTicket,
} from "@/services/maintenanceTicketService";
import type { MaintenanceTicketCategory } from "@/services/types";

export async function GET(request: Request) {
  try {
    const tenantId = new URL(request.url).searchParams.get("tenant_id")?.trim() ?? "";
    if (!tenantId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const tickets = await listTenantMaintenanceTickets(tenantId);
    return NextResponse.json({ ok: true, tickets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดรายการไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

const VALID_CATEGORIES = new Set<MaintenanceTicketCategory>([
  "ac",
  "plumbing",
  "electrical",
  "other",
]);

function parseCategory(value: FormDataEntryValue | null): MaintenanceTicketCategory | null {
  if (typeof value !== "string") return null;
  return VALID_CATEGORIES.has(value as MaintenanceTicketCategory)
    ? (value as MaintenanceTicketCategory)
    : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tenantId = String(formData.get("tenant_id") ?? "");
    const category = parseCategory(formData.get("category"));
    const description = String(formData.get("description") ?? "");
    const photo = formData.get("photo");

    if (!tenantId || !category) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const ticket = await submitMaintenanceTicket({
      tenantId,
      category,
      description,
      photo: photo instanceof File && photo.size > 0 ? photo : null,
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ส่งเรื่องไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
