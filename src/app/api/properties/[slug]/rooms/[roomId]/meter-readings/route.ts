import { NextResponse } from "next/server";
import {
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
