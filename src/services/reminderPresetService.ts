import type { Locale } from "@/services/i18n/messages";
import {
  normalizeReminderDaySettings,
  type ReminderDaySettings,
} from "@/services/paymentReminderTier";

export type ReminderPresetId =
  | "balanced"
  | "early"
  | "gentle"
  | "assertive"
  | "custom";

export type NamedReminderPresetId = Exclude<ReminderPresetId, "custom">;

export const DEFAULT_REMINDER_PRESET: NamedReminderPresetId = "balanced";

export const NAMED_REMINDER_PRESETS: readonly NamedReminderPresetId[] = [
  "balanced",
  "early",
  "gentle",
  "assertive",
] as const;

export const REMINDER_PRESETS: Record<NamedReminderPresetId, ReminderDaySettings> =
  {
    balanced: { soft: 1, firm: 3, final: 7 },
    early: { soft: 3, firm: 3, final: 7 },
    gentle: { soft: 3, firm: 5, final: 10 },
    assertive: { soft: 1, firm: 1, final: 5 },
  };

export function daysForReminderPreset(
  id: NamedReminderPresetId,
): ReminderDaySettings {
  return normalizeReminderDaySettings(REMINDER_PRESETS[id]);
}

export function detectReminderPreset(
  days: ReminderDaySettings,
): ReminderPresetId {
  const normalized = normalizeReminderDaySettings(days);
  for (const id of NAMED_REMINDER_PRESETS) {
    const preset = REMINDER_PRESETS[id];
    if (
      preset.soft === normalized.soft &&
      preset.firm === normalized.firm &&
      preset.final === normalized.final
    ) {
      return id;
    }
  }
  return "custom";
}

export function isNamedReminderPreset(
  value: string | null | undefined,
): value is NamedReminderPresetId {
  return (
    value === "balanced" ||
    value === "early" ||
    value === "gentle" ||
    value === "assertive"
  );
}

/** Resolve preset from stored id + days; days win so fine-tune can snap back. */
export function parseReminderPreset(
  _value: string | null | undefined,
  days: ReminderDaySettings,
): ReminderPresetId {
  return detectReminderPreset(days);
}

export function formatReminderChipLabel(days: ReminderDaySettings): string {
  const n = normalizeReminderDaySettings(days);
  return `T−${n.soft} · +${n.firm} · +${n.final}`;
}

function formatShortDate(date: Date, locale: Locale) {
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

/** Example schedule for UI preview (sample month = Jul 2026). */
export function buildReminderSchedulePreview(
  billingDay: number,
  days: ReminderDaySettings,
  locale: Locale = "th",
) {
  const year = 2026;
  const month = 7;
  const day = Math.min(Math.max(Math.round(billingDay) || 1, 1), 28);
  const due = new Date(year, month - 1, day);
  const soft = new Date(due);
  soft.setDate(soft.getDate() - days.soft);
  const firm = new Date(due);
  firm.setDate(firm.getDate() + days.firm);
  const final = new Date(due);
  final.setDate(final.getDate() + days.final);

  return {
    due: formatShortDate(due, locale),
    soft: formatShortDate(soft, locale),
    firm: formatShortDate(firm, locale),
    final: formatShortDate(final, locale),
  };
}
