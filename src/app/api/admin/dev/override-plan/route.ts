import { NextResponse } from "next/server";
import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import {
  getOwnerQaSnapshot,
  overrideOwnerPlan,
} from "@/services/devPlanOverrideService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { requireSuperadmin } from "@/services/superadminGuard";

function devForbidden() {
  return NextResponse.json({ error: "Dev tools disabled" }, { status: 403 });
}

export async function GET(request: Request) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;
    assertDevToolsEnabled();

    const email = new URL(request.url).searchParams.get("email") ?? "";
    const snapshot = await getOwnerQaSnapshot(email);
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    if (error instanceof Error && error.message === "DEV_TOOLS_DISABLED") {
      return devForbidden();
    }
    const message = error instanceof Error ? error.message : "โหลดไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperadmin(request);
    if ("error" in auth) return auth.error;
    assertDevToolsEnabled();

    const body = (await request.json()) as {
      owner_email?: string;
      plan_tier?: PlanTier;
    };

    const result = await overrideOwnerPlan({
      owner_email: body.owner_email ?? "",
      plan_tier: body.plan_tier ?? "starter",
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Error && error.message === "DEV_TOOLS_DISABLED") {
      return devForbidden();
    }
    const message = error instanceof Error ? error.message : "อัปเดตแผนไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
