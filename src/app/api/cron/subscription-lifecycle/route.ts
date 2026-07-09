import { NextResponse } from "next/server";
import { safeNotifySubscriptionGrace } from "@/services/notificationService";
import {
  downgradeOwnerToStarter,
  getOwnerLineUserId,
  listPaidOwnersForLifecycle,
  markGraceNotifiedToday,
  resolveSubscriptionPhase,
  shouldNotifyGraceToday,
} from "@/services/subscriptionLifecycleService";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const owners = await listPaidOwnersForLifecycle();
    let downgraded = 0;
    let graceNotified = 0;
    let graceSkipped = 0;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

    for (const owner of owners) {
      const lifecycle = resolveSubscriptionPhase(owner.plan_tier, owner.expires_at);

      if (lifecycle.phase === "lapsed") {
        await downgradeOwnerToStarter(owner.id);
        downgraded += 1;
        continue;
      }

      if (lifecycle.phase !== "grace") continue;
      if (!shouldNotifyGraceToday(owner.last_grace_notify_at)) {
        graceSkipped += 1;
        continue;
      }

      const lineUserId = await getOwnerLineUserId(owner.id);
      if (!lineUserId) {
        graceSkipped += 1;
        continue;
      }

      const billingUrl = baseUrl ? `${baseUrl}/billing` : "/billing";
      const result = await safeNotifySubscriptionGrace({
        lineUserId,
        planTier: owner.plan_tier,
        graceDaysRemaining: lifecycle.grace_days_remaining ?? 0,
        billingUrl,
      });

      if (result.sent) {
        await markGraceNotifiedToday(owner.id);
        graceNotified += 1;
      } else {
        graceSkipped += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      processed: owners.length,
      downgraded,
      graceNotified,
      graceSkipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
