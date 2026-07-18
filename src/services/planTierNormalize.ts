export type PlanTier = "free" | "premium";

const LEGACY_PREMIUM = new Set(["premium", "micro", "growth", "pro"]);

export function normalizePlanTier(raw: string): PlanTier {
  if (LEGACY_PREMIUM.has(raw)) return "premium";
  return "free";
}
