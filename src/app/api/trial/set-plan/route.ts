import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import type { PlanTier } from "@/services/propertyQuotaService";
import {
  assertTrialEnabled,
  assertTrialOwner,
  parseTrialPlanTier,
} from "@/services/trialSandboxService";
import { setTrialPlanTier } from "@/services/trialSeedService";

export async function POST(request: Request) {
  try {
    assertTrialEnabled();

    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    assertTrialOwner(auth.ownerId);

    const body = (await request.json()) as { plan?: string };
    const planTier = parseTrialPlanTier(body.plan) as PlanTier;
    const result = await setTrialPlanTier(planTier);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TRIAL_DISABLED") {
        return NextResponse.json({ error: "Trial sandbox is disabled" }, { status: 403 });
      }
      if (error.message === "NOT_TRIAL_OWNER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const message = error instanceof Error ? error.message : "Set plan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
