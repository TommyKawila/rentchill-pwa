import { NextResponse } from "next/server";
import { assertTrialEnabled } from "@/services/trialSandboxService";
import { seedTrialProperty } from "@/services/trialSeedService";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function runTrialReset() {
  assertTrialEnabled();
  const result = await seedTrialProperty({ force: true });
  return NextResponse.json({ ok: true, ...result });
}

function handleTrialResetError(error: unknown) {
  if (error instanceof Error && error.message === "TRIAL_DISABLED") {
    return NextResponse.json({ error: "Trial sandbox is disabled" }, { status: 403 });
  }
  const message = error instanceof Error ? error.message : "Trial reset failed";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runTrialReset();
  } catch (error) {
    return handleTrialResetError(error);
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runTrialReset();
  } catch (error) {
    return handleTrialResetError(error);
  }
}
