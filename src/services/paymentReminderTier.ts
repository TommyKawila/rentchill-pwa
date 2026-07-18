import { daysRelativeToDue } from "@/services/billingDueDateService";

export type ReminderTier = "soft" | "firm" | "final";

export const REMINDER_TIER_ORDER: ReminderTier[] = ["soft", "firm", "final"];

export type ReminderDaySettings = {
  soft: number;
  firm: number;
  final: number;
};

/** soft = days before due; firm/final = days overdue */
export const DEFAULT_REMINDER_DAYS: ReminderDaySettings = {
  soft: 1,
  firm: 3,
  final: 7,
};

const TIER_RANK: Record<ReminderTier, number> = {
  soft: 1,
  firm: 2,
  final: 3,
};

export function clampPaymentReminderDay(value: number) {
  return Math.min(28, Math.max(1, Math.round(value)));
}

export function normalizeReminderDaySettings(input: {
  soft: number;
  firm: number;
  final: number;
}): ReminderDaySettings {
  let soft = clampPaymentReminderDay(input.soft);
  let firm = clampPaymentReminderDay(input.firm);
  let final = clampPaymentReminderDay(input.final);

  if (firm >= final) {
    final = Math.min(28, firm + 1);
  }
  if (firm >= final) {
    firm = Math.max(1, final - 1);
  }

  return { soft, firm, final };
}

function tierTargetRelative(tier: ReminderTier, settings: ReminderDaySettings) {
  if (tier === "soft") return -settings.soft;
  if (tier === "firm") return settings.firm;
  return settings.final;
}

export function daysSinceReminderTierSent(
  tierSent: ReminderTier,
  daysRelativeToDue: number,
  settings: ReminderDaySettings,
): number {
  return Math.max(0, daysRelativeToDue - tierTargetRelative(tierSent, settings));
}

export function recommendedReminderTier(
  daysRelative: number,
  settings: ReminderDaySettings,
): ReminderTier | null {
  let recommended: ReminderTier | null = null;
  if (daysRelative === -settings.soft) recommended = "soft";
  if (daysRelative >= settings.firm) recommended = "firm";
  if (daysRelative >= settings.final) recommended = "final";
  return recommended;
}

export function reminderTierRank(tier: ReminderTier | null | undefined) {
  if (!tier) return 0;
  return TIER_RANK[tier];
}

export function canSendReminderTier(
  recommended: ReminderTier | null,
  alreadySent: ReminderTier | null,
): boolean {
  if (!recommended) return false;
  return reminderTierRank(recommended) > reminderTierRank(alreadySent);
}

function isTierReady(
  tier: ReminderTier,
  daysRelative: number,
  settings: ReminderDaySettings,
) {
  const target = tierTargetRelative(tier, settings);
  if (tier === "soft") return daysRelative === target;
  return daysRelative >= target;
}

export function daysUntilNextReminderTier(
  daysRelative: number,
  nextTier: ReminderTier,
  settings: ReminderDaySettings,
): number | null {
  const target = tierTargetRelative(nextTier, settings);
  if (isTierReady(nextTier, daysRelative, settings)) return null;
  return target - daysRelative;
}

export function resolveReminderState(input: {
  billingMonth: string;
  billingDay: number;
  tierSent: ReminderTier | null;
  settings: ReminderDaySettings;
  now?: Date;
}) {
  const daysRelative = daysRelativeToDue(
    input.billingMonth,
    input.billingDay,
    input.now,
  );

  if (daysRelative === null) {
    return {
      days_relative_to_due: null as number | null,
      recommended: null as ReminderTier | null,
      can_send: false,
      days_until_soft: null as number | null,
    };
  }

  const recommended = recommendedReminderTier(daysRelative, input.settings);
  let daysUntilSoft: number | null = null;
  if (
    !input.tierSent &&
    !isTierReady("soft", daysRelative, input.settings)
  ) {
    const days = daysUntilNextReminderTier(
      daysRelative,
      "soft",
      input.settings,
    );
    daysUntilSoft = days != null && days > 0 ? days : null;
  }

  return {
    days_relative_to_due: daysRelative,
    recommended,
    can_send: canSendReminderTier(recommended, input.tierSent),
    days_until_soft: daysUntilSoft,
  };
}

export type ReminderStepStatus = "done" | "ready" | "countdown" | "upcoming";

export type ReminderTimeline = {
  nextTier: ReminderTier | null;
  daysUntilNext: number | null;
  steps: Record<ReminderTier, ReminderStepStatus>;
  allTiersSent: boolean;
  daysRelativeToDue: number;
};

function isTierSent(tier: ReminderTier, tierSent: ReminderTier | null) {
  return reminderTierRank(tierSent) >= reminderTierRank(tier);
}

export function buildReminderTimeline(input: {
  billingMonth: string;
  billingDay: number;
  tierSent: ReminderTier | null;
  settings: ReminderDaySettings;
  now?: Date;
}): ReminderTimeline | null {
  const daysRelative = daysRelativeToDue(
    input.billingMonth,
    input.billingDay,
    input.now,
  );
  if (daysRelative === null) return null;

  const allTiersSent = input.tierSent === "final";
  const recommended = recommendedReminderTier(daysRelative, input.settings);

  const steps = {} as Record<ReminderTier, ReminderStepStatus>;
  for (const tier of REMINDER_TIER_ORDER) {
    if (isTierSent(tier, input.tierSent)) {
      steps[tier] = "done";
      continue;
    }
    if (isTierReady(tier, daysRelative, input.settings)) {
      steps[tier] = "ready";
      continue;
    }
    const daysUntil = daysUntilNextReminderTier(
      daysRelative,
      tier,
      input.settings,
    );
    if (daysUntil != null && daysUntil > 0) {
      steps[tier] = "countdown";
      continue;
    }
    steps[tier] = "upcoming";
  }

  let nextTier: ReminderTier | null = null;
  let daysUntilNext: number | null = null;

  if (!allTiersSent) {
    for (const tier of REMINDER_TIER_ORDER) {
      if (isTierSent(tier, input.tierSent)) continue;
      const daysUntil = daysUntilNextReminderTier(
        daysRelative,
        tier,
        input.settings,
      );
      if (daysUntil != null && daysUntil > 0) {
        nextTier = tier;
        daysUntilNext = daysUntil;
        break;
      }
    }

    if (
      !nextTier &&
      recommended &&
      !isTierSent(recommended, input.tierSent) &&
      isTierReady(recommended, daysRelative, input.settings)
    ) {
      nextTier = recommended;
      daysUntilNext = null;
    }
  }

  return {
    nextTier,
    daysUntilNext,
    steps,
    allTiersSent,
    daysRelativeToDue: daysRelative,
  };
}
