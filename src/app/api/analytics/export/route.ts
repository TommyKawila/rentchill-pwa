import { NextResponse } from "next/server";
import {
  getAnalyticsReport,
  type AnalyticsTimeframe,
} from "@/services/analyticsCashflowService";
import { buildAnalyticsWorkbook } from "@/services/analyticsExportService";
import { assertOwnerWithinRoomLimit } from "@/services/planGateService";
import { jsonFromPlanGate } from "@/services/planGateApi";
import { requireOwnerId } from "@/services/ownerApiGuard";

const VALID_TIMEFRAMES = new Set<AnalyticsTimeframe>([
  "this_year",
  "last_year",
  "last_3_months",
]);

export async function GET(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    await assertOwnerWithinRoomLimit(auth.ownerId);

    const { searchParams } = new URL(request.url);
    const timeframeRaw = searchParams.get("timeframe") ?? "this_year";
    const timeframe = VALID_TIMEFRAMES.has(timeframeRaw as AnalyticsTimeframe)
      ? (timeframeRaw as AnalyticsTimeframe)
      : "this_year";
    const propertySlug = searchParams.get("property_slug");
    const roomId = searchParams.get("room_id");

    const report = await getAnalyticsReport({
      ownerId: auth.ownerId,
      timeframe,
      propertySlug,
      roomId,
    });

    const { buffer, filename } = buildAnalyticsWorkbook(report);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const gate = jsonFromPlanGate(error);
    if (gate) return gate;
    console.error("[analytics.export.GET]", {}, error);
    const message = error instanceof Error ? error.message : "ส่งออกไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
