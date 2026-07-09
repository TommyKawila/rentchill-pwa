import { getLineAccessToken, lineBotFetch } from "@/services/line/lineApiClient";

export type LineOaInferredPlan = "free" | "basic" | "pro" | "unknown";
export type LineOaAlertLevel = "ok" | "warning" | "critical" | "unavailable";

export type LineOaQuotaSnapshot = {
  available: boolean;
  quota_limit: number | null;
  quota_used: number;
  quota_remaining: number | null;
  usage_percent: number | null;
  inferred_plan: LineOaInferredPlan;
  alert_level: LineOaAlertLevel;
  next_plan_hint: LineOaInferredPlan | null;
};

function inferPlan(limit: number | null): LineOaInferredPlan {
  if (limit === null) return "unknown";
  if (limit <= 300) return "free";
  if (limit <= 15000) return "basic";
  if (limit <= 35000) return "pro";
  return "unknown";
}

function nextPlanHint(plan: LineOaInferredPlan): LineOaInferredPlan | null {
  if (plan === "free") return "basic";
  if (plan === "basic") return "pro";
  return null;
}

function computeAlertLevel(
  limit: number | null,
  percent: number | null,
): LineOaAlertLevel {
  if (limit === null || percent === null) return "unavailable";
  if (percent >= 95) return "critical";
  if (percent >= 80) return "warning";
  return "ok";
}

export async function getLineOaQuotaSnapshot(): Promise<LineOaQuotaSnapshot> {
  const unavailable: LineOaQuotaSnapshot = {
    available: false,
    quota_limit: null,
    quota_used: 0,
    quota_remaining: null,
    usage_percent: null,
    inferred_plan: "unknown",
    alert_level: "unavailable",
    next_plan_hint: null,
  };

  if (!getLineAccessToken()) return unavailable;

  try {
    const [quotaPayload, consumptionPayload] = await Promise.all([
      lineBotFetch("/message/quota"),
      lineBotFetch("/message/quota/consumption"),
    ]);

    const quotaType = String(quotaPayload.type ?? "");
    const quotaLimit =
      quotaType === "limited" && typeof quotaPayload.value === "number"
        ? quotaPayload.value
        : null;
    const quotaUsed =
      typeof consumptionPayload.totalUsage === "number"
        ? consumptionPayload.totalUsage
        : 0;

    const quotaRemaining =
      quotaLimit !== null ? Math.max(0, quotaLimit - quotaUsed) : null;
    const usagePercent =
      quotaLimit !== null && quotaLimit > 0
        ? Math.round((quotaUsed / quotaLimit) * 100)
        : null;
    const inferredPlan = inferPlan(quotaLimit);

    return {
      available: true,
      quota_limit: quotaLimit,
      quota_used: quotaUsed,
      quota_remaining: quotaRemaining,
      usage_percent: usagePercent,
      inferred_plan: inferredPlan,
      alert_level: computeAlertLevel(quotaLimit, usagePercent),
      next_plan_hint: nextPlanHint(inferredPlan),
    };
  } catch (error) {
    console.error("[lineOaQuota]", error);
    return unavailable;
  }
}
