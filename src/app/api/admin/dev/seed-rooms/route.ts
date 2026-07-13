import { NextResponse } from "next/server";
import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import { seedPropertyRooms } from "@/services/devPropertySeedService";
import { requireSuperadmin } from "@/services/superadminGuard";

function devForbidden() {
  return NextResponse.json({ error: "Dev tools disabled" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;
    assertDevToolsEnabled();

    const body = (await request.json()) as {
      property_slug?: string;
      room_count?: number;
      mode?: "replace" | "append";
      line_mode?: "none" | "synthetic";
      status_mix?: "fresh" | "mixed";
      with_meters?: boolean;
    };

    const result = await seedPropertyRooms({
      property_slug: body.property_slug ?? "",
      room_count: Number(body.room_count ?? 0),
      mode: body.mode,
      line_mode: body.line_mode,
      status_mix: body.status_mix,
      with_meters: body.with_meters,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "DEV_TOOLS_DISABLED") {
      return devForbidden();
    }
    const message = error instanceof Error ? error.message : "seed ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
