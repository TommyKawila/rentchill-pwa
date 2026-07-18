import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { assignTenantToVacantRoom } from "@/services/roomTenantService";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as {
      base_rent_price?: number;
      tenant_name?: string;
      phone_number?: string;
      move_in_date?: string;
      water_reading?: number;
      electric_reading?: number;
    };

    const result = await assignTenantToVacantRoom(auth.ownerId, {
      property_slug: slug,
      room_id: roomId,
      base_rent_price:
        body.base_rent_price !== undefined
          ? Number(body.base_rent_price)
          : undefined,
      tenant_name: body.tenant_name ?? "",
      phone_number: body.phone_number ?? "",
      move_in_date: body.move_in_date,
      water_reading: Number(body.water_reading),
      electric_reading: Number(body.electric_reading),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_NOT_VACANT") {
      return NextResponse.json(
        { error: "ROOM_NOT_VACANT", messageKey: "owner.roomLifecycle.roomNotVacant" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "TENANT_STILL_PRESENT") {
      return NextResponse.json(
        {
          error: "TENANT_STILL_PRESENT",
          messageKey: "owner.roomLifecycle.tenantStillPresent",
        },
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

    console.error("[rooms.assignTenant.POST]", { roomId: (await context.params).roomId }, error);
    const message = error instanceof Error ? error.message : "ASSIGN_TENANT_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
