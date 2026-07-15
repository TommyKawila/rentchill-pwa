import type { BillingOverview } from "@/services/billingOverviewService";

const STORAGE_PREFIX = "rentchill_quest_reward_";

export function isQuestComplete(overview: BillingOverview): boolean {
  return overview.notIssued === 0 && overview.total > 0;
}

export function isChillMode(
  overview: BillingOverview,
  showMeterReminder: boolean,
): boolean {
  return isQuestComplete(overview) && !showMeterReminder;
}

function rewardKey(propertySlug: string, billingMonth: string) {
  return `${STORAGE_PREFIX}${propertySlug}_${billingMonth}`;
}

export function shouldShowReward(
  propertySlug: string,
  billingMonth: string,
): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(rewardKey(propertySlug, billingMonth)) !== "1";
}

export function markRewardShown(propertySlug: string, billingMonth: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(rewardKey(propertySlug, billingMonth), "1");
}
