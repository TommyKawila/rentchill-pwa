import type { MessageKey } from "@/services/i18n/messages";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  daysSinceReminderTierSent,
  type ReminderDaySettings,
  type ReminderTier,
} from "@/services/paymentReminderTier";

export type RoomReminderCardMeta = {
  lineKey: MessageKey;
  lineParams: Record<string, string | number>;
  tierKey?: MessageKey;
  toneClass: string;
};

function tierMessageKey(
  tier: ReminderTier,
):
  | "owner.reminder.timeline.tierSoft"
  | "owner.reminder.timeline.tierFirm"
  | "owner.reminder.timeline.tierFinal" {
  if (tier === "soft") return "owner.reminder.timeline.tierSoft";
  if (tier === "firm") return "owner.reminder.timeline.tierFirm";
  return "owner.reminder.timeline.tierFinal";
}

function toneForTier(tier: ReminderTier) {
  if (tier === "soft") return "text-rc-green-ink";
  if (tier === "firm") return "text-amber-800";
  return "text-red-700";
}

export function getRoomReminderCardMeta(
  row: MonthlyBillingRow,
  settings: ReminderDaySettings,
): RoomReminderCardMeta | null {
  if (row.invoice_status !== "pending" || !row.line_linked) return null;

  const daysRelative = row.reminder_timeline?.daysRelativeToDue ?? null;

  if (row.reminder_tier_sent && daysRelative !== null) {
    return {
      lineKey: "owner.rooms.reminderSentLine",
      tierKey: tierMessageKey(row.reminder_tier_sent),
      lineParams: {
        days: daysSinceReminderTierSent(
          row.reminder_tier_sent,
          daysRelative,
          settings,
        ),
      },
      toneClass: toneForTier(row.reminder_tier_sent),
    };
  }

  if (row.reminder_can_send && row.reminder_recommended) {
    return {
      lineKey: "owner.rooms.reminderReadyLine",
      tierKey: tierMessageKey(row.reminder_recommended),
      lineParams: {},
      toneClass: toneForTier(row.reminder_recommended),
    };
  }

  if (
    row.reminder_days_until_soft != null &&
    row.reminder_days_until_soft > 0
  ) {
    return {
      lineKey: "owner.rooms.reminderWaitingLine",
      lineParams: { days: row.reminder_days_until_soft },
      toneClass: "text-zinc-500",
    };
  }

  const waitDays = row.reminder_timeline?.daysUntilNext;
  if (waitDays != null && waitDays > 0) {
    return {
      lineKey: "owner.rooms.reminderWaitingLine",
      lineParams: { days: waitDays },
      toneClass: "text-zinc-500",
    };
  }

  return {
    lineKey: "owner.rooms.reminderNotSentLine",
    lineParams: {},
    toneClass: "text-zinc-400",
  };
}
