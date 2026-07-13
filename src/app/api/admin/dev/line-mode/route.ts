import { NextResponse } from "next/server";
import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import {
  getLineModeStatus,
  getLineTestPreview,
  getRecentLinePushLogs,
  LINE_TEST_TYPES,
} from "@/services/devLineTestService";
import type { LinePushType } from "@/services/linePushQuotaService";
import { requireSuperadmin } from "@/services/superadminGuard";

function devForbidden() {
  return NextResponse.json({ error: "Dev tools disabled" }, { status: 403 });
}

export async function GET(request: Request) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;
    assertDevToolsEnabled();

    const params = new URL(request.url).searchParams;
    const previewType = params.get("preview") as LinePushType | null;

    const [mode, logs] = await Promise.all([
      getLineModeStatus(),
      getRecentLinePushLogs(20),
    ]);

    const payload: Record<string, unknown> = {
      ok: true,
      mode,
      logs,
      types: LINE_TEST_TYPES,
    };

    if (previewType && LINE_TEST_TYPES.includes(previewType)) {
      payload.preview = getLineTestPreview(previewType);
    }

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof Error && error.message === "DEV_TOOLS_DISABLED") {
      return devForbidden();
    }
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
