import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { createRoomWithTenant } from "@/services/roomTenantService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property_slug?: string;
      room_number?: string;
      base_rent_price?: number;
      tenant_name?: string;
      phone_number?: string;
      move_in_date?: string;
      water_reading?: number;
      electric_reading?: number;
    };

    if (!body.property_slug?.trim()) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await createRoomWithTenant(auth.ownerId, {
      property_slug: body.property_slug,
      room_number: body.room_number ?? "",
      base_rent_price: Number(body.base_rent_price ?? 0),
      tenant_name: body.tenant_name ?? "",
      phone_number: body.phone_number ?? "",
      move_in_date: body.move_in_date,
      water_reading: Number(body.water_reading),
      electric_reading: Number(body.electric_reading),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_LIMIT_EXCEEDED") {
      const detail = error as Error & { limit?: number; total?: number };
      return NextResponse.json(
        {
          error: "ROOM_LIMIT_EXCEEDED",
          message: `เกินโควต้าห้องรวม ${detail.total ?? "?"}/${detail.limit ?? "?"} — อัปเกรดแผนเพื่อเพิ่มห้อง`,
        },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "ROOM_NUMBER_EXISTS") {
      return NextResponse.json(
        { error: "ROOM_NUMBER_EXISTS", message: "เลขห้องนี้มีอยู่แล้ว" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "METER_BASELINE_REQUIRED") {
      return NextResponse.json(
        {
          error: "METER_BASELINE_REQUIRED",
          message: "กรุณาจดเลขมิเตอร์น้ำ-ไฟวันเข้าอยู่",
        },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "เพิ่มห้องไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
