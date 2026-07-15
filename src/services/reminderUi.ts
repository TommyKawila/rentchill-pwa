import type { ReminderTier } from "@/services/paymentReminderTier";

export const REMINDER_TIER_BUTTON_CLASS: Record<ReminderTier, string> = {
  soft: "border-rc-green/30 bg-rc-green-soft text-zinc-900",
  firm: "border-amber-300 bg-amber-50 text-amber-900",
  final: "border-red-200 bg-red-50 text-red-700",
};

export function reminderTierMessageKey(
  tier: ReminderTier,
): "owner.reminder.sendSoft" | "owner.reminder.sendFirm" | "owner.reminder.sendFinal" {
  if (tier === "soft") return "owner.reminder.sendSoft";
  if (tier === "firm") return "owner.reminder.sendFirm";
  return "owner.reminder.sendFinal";
}

export function reminderSentTierMessageKey(
  tier: ReminderTier,
):
  | "owner.reminder.sentSoft"
  | "owner.reminder.sentFirm"
  | "owner.reminder.sentFinal" {
  if (tier === "soft") return "owner.reminder.sentSoft";
  if (tier === "firm") return "owner.reminder.sentFirm";
  return "owner.reminder.sentFinal";
}
