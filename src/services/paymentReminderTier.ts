export type ReminderTier = "soft" | "firm" | "final";

export const REMINDER_TIER_ORDER: ReminderTier[] = ["soft", "firm", "final"];

export type ReminderDaySettings = {
  soft: number;
  firm: number;
  final: number;
};

export const DEFAULT_REMINDER_DAYS: ReminderDaySettings = {
  soft: 3,
  firm: 7,
  final: 10,
};

const TIER_RANK: Record<ReminderTier, number> = {
  soft: 1,
  firm: 2,
  final: 3,
};

const BANGKOK = "Asia/Bangkok";

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

  if (soft >= firm) firm = Math.min(28, soft + 1);
  if (firm >= final) final = Math.min(28, firm + 1);
  if (soft >= firm) soft = Math.max(1, firm - 1);
  if (firm >= final) {
    firm = Math.max(soft + 1, final - 1);
  }

  return { soft, firm, final };
}

function bangkokYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

/** Whole calendar days since issued_at in Asia/Bangkok (0 = same day). */
export function daysSinceIssued(issuedAt: string, now = new Date()) {
  const issued = bangkokYmd(new Date(issuedAt));
  const today = bangkokYmd(now);
  const a = Date.UTC(issued.year, issued.month - 1, issued.day);
  const b = Date.UTC(today.year, today.month - 1, today.day);
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function recommendedReminderTier(
  daysSince: number,
  settings: ReminderDaySettings,
): ReminderTier | null {
  if (daysSince >= settings.final) return "final";
  if (daysSince >= settings.firm) return "firm";
  if (daysSince >= settings.soft) return "soft";
  return null;
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

export function daysUntilSoftReminder(
  daysSince: number,
  softDays: number,
): number | null {
  if (daysSince >= softDays) return null;
  return softDays - daysSince;
}

export function resolveReminderState(input: {
  issuedAt: string | null;
  tierSent: ReminderTier | null;
  settings: ReminderDaySettings;
  now?: Date;
}) {
  if (!input.issuedAt) {
    return {
      days_since_issue: null as number | null,
      recommended: null as ReminderTier | null,
      can_send: false,
      days_until_soft: null as number | null,
    };
  }

  const days = daysSinceIssued(input.issuedAt, input.now);
  const recommended = recommendedReminderTier(days, input.settings);
  return {
    days_since_issue: days,
    recommended,
    can_send: canSendReminderTier(recommended, input.tierSent),
    days_until_soft: daysUntilSoftReminder(days, input.settings.soft),
  };
}

export type ReminderStepStatus = "done" | "ready" | "countdown" | "upcoming";

export type ReminderTimeline = {
  nextTier: ReminderTier | null;
  daysUntilNext: number | null;
  steps: Record<ReminderTier, ReminderStepStatus>;
  allTiersSent: boolean;
  daysSinceIssue: number;
};

function tierDaysFor(tier: ReminderTier, settings: ReminderDaySettings) {
  if (tier === "soft") return settings.soft;
  if (tier === "firm") return settings.firm;
  return settings.final;
}

function isTierSent(tier: ReminderTier, tierSent: ReminderTier | null) {
  return reminderTierRank(tierSent) >= reminderTierRank(tier);
}

export function buildReminderTimeline(input: {
  issuedAt: string | null;
  tierSent: ReminderTier | null;
  settings: ReminderDaySettings;
  now?: Date;
}): ReminderTimeline | null {
  if (!input.issuedAt) return null;

  const daysSinceIssue = daysSinceIssued(input.issuedAt, input.now);
  const allTiersSent = input.tierSent === "final";

  let nextTier: ReminderTier | null = null;
  for (const tier of REMINDER_TIER_ORDER) {
    if (!isTierSent(tier, input.tierSent)) {
      nextTier = tier;
      break;
    }
  }

  const steps = {} as Record<ReminderTier, ReminderStepStatus>;
  for (const tier of REMINDER_TIER_ORDER) {
    if (isTierSent(tier, input.tierSent)) {
      steps[tier] = "done";
      continue;
    }
    if (tier === nextTier) {
      const requiredDays = tierDaysFor(tier, input.settings);
      if (daysSinceIssue >= requiredDays) {
        steps[tier] = "ready";
      } else {
        steps[tier] = "countdown";
      }
      continue;
    }
    steps[tier] = "upcoming";
  }

  let daysUntilNext: number | null = null;
  if (nextTier && !allTiersSent) {
    const requiredDays = tierDaysFor(nextTier, input.settings);
    if (daysSinceIssue >= requiredDays) {
      daysUntilNext = null;
    } else {
      daysUntilNext = requiredDays - daysSinceIssue;
    }
  }

  return {
    nextTier,
    daysUntilNext,
    steps,
    allTiersSent,
    daysSinceIssue,
  };
}
