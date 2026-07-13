import { NextResponse } from "next/server";
import { logAuditForSlug } from "@/services/auditLogService";
import {
  backfillMoveInBaseline,
  buildMeterHistoryRows,
  getMeterHistory,
} from "@/services/meterReadingService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { createAdminClient } from "@/services/supabase/admin";

type Params = { slug: string; roomId: string };

export async function GET(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const supabase = createAdminClient();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, property_id, properties!inner(slug)")
      .eq("id", roomId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) {
      return NextResponse.json({ error: "ไม่พบห้อง" }, { status: 404 });
    }

    const propertyRaw = room.properties as { slug: string } | { slug: string }[];
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
    if (property.slug !== slug) {
      return NextResponse.json({ error: "ไม่พบห้อง" }, { status: 404 });
    }

    const readings = await getMeterHistory(roomId);
    const rows = buildMeterHistoryRows(readings);
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as {
      tenant_id?: string;
      water_reading?: number;
      electric_reading?: number;
    };

    const tenantId = body.tenant_id;
    const water = Number(body.water_reading);
    const electric = Number(body.electric_reading);

    if (!tenantId) {
      return NextResponse.json({ error: "ไม่พบ tenant_id" }, { status: 400 });
    }
    if (
      !Number.isFinite(water) ||
      !Number.isFinite(electric) ||
      water < 0 ||
      electric < 0
    ) {
      return NextResponse.json({ error: "เลขมิเตอร์ไม่ถูกต้อง" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, property_id")
      .eq("id", roomId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) {
      return NextResponse.json({ error: "ไม่พบห้อง" }, { status: 404 });
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("room_id", roomId)
      .maybeSingle();

    if (tenantError) throw tenantError;
    if (!tenant) {
      return NextResponse.json({ error: "ไม่พบผู้เช่า" }, { status: 400 });
    }

    await backfillMoveInBaseline({
      propertyId: String(room.property_id),
      roomId,
      tenantId,
      waterReading: water,
      electricReading: electric,
    });

    await logAuditForSlug({
      propertySlug: slug,
      roomId,
      tenantId,
      actorType: "owner",
      actorId: auth.ownerId,
      action: "meter.baseline",
      detail: { water_reading: water, electric_reading: electric },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
    const message = raw === "BASELINE_EXISTS" ? "มีมิเตอร์เริ่มต้นแล้ว" : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
