import { NextResponse } from "next/server";
import {
  createOwnerSessionToken,
  getAdminCookieName,
} from "@/services/adminAuth";
import {
  assertTrialEnabled,
  getTrialOwnerId,
  getTrialPropertySlug,
  parseTrialPlanTier,
} from "@/services/trialSandboxService";
import { seedTrialProperty } from "@/services/trialSeedService";

export async function POST(request: Request) {
  try {
    assertTrialEnabled();

    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
    }

    let planRaw: string | undefined;
    try {
      const body = (await request.json()) as { plan?: string };
      planRaw = body.plan;
    } catch {
      planRaw = undefined;
    }

    const planTier = parseTrialPlanTier(planRaw);
    const seed = await seedTrialProperty({ planTier });
    const ownerId = getTrialOwnerId();
    const token = await createOwnerSessionToken(ownerId, secret);

    const response = NextResponse.json({
      ok: true,
      property_slug: getTrialPropertySlug(),
      plan_tier: seed.plan_tier ?? planTier,
      redirect: `/dashboard?property=${encodeURIComponent(getTrialPropertySlug())}`,
      tenant_board_url: `/board?invite=${encodeURIComponent(seed.tenant_invite_code ?? "RCTRY1")}`,
      reset_expires_at: seed.reset_expires_at,
    });

    response.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_DISABLED") {
      return NextResponse.json({ error: "Trial sandbox is disabled" }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Trial start failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
