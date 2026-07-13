import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import {
  assertTrialEnabled,
  assertTrialOwner,
  isTrialEnabled,
} from "@/services/trialSandboxService";
import { getTrialStatus } from "@/services/trialSeedService";

export async function GET(request: Request) {
  try {
    if (!isTrialEnabled()) {
      return NextResponse.json({ ok: true, enabled: false });
    }

    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    assertTrialEnabled();
    assertTrialOwner(auth.ownerId);

    const status = await getTrialStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_TRIAL_OWNER") {
      return NextResponse.json({ ok: true, enabled: false });
    }
    const message = error instanceof Error ? error.message : "Trial status failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
