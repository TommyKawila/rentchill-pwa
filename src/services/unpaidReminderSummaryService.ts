import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { ReminderTier } from "@/services/paymentReminderTier";

export type UnpaidReminderSummary = {
  unpaid: number;
  readyByTier: { soft: number; firm: number; final: number };
  waitingForDays: number;
  noLine: number;
  awaitingNextTier: number;
};

export function computeUnpaidReminderSummary(
  rows: MonthlyBillingRow[],
): UnpaidReminderSummary {
  const summary: UnpaidReminderSummary = {
    unpaid: 0,
    readyByTier: { soft: 0, firm: 0, final: 0 },
    waitingForDays: 0,
    noLine: 0,
    awaitingNextTier: 0,
  };

  for (const row of rows) {
    if (row.invoice_status !== "pending") continue;

    summary.unpaid += 1;

    if (!row.line_linked) {
      summary.noLine += 1;
      continue;
    }

    if (row.reminder_can_send && row.reminder_recommended) {
      summary.readyByTier[row.reminder_recommended as ReminderTier] += 1;
      continue;
    }

    if (row.reminder_days_until_soft != null) {
      summary.waitingForDays += 1;
      continue;
    }

    if (row.reminder_tier_sent && !row.reminder_can_send) {
      summary.awaitingNextTier += 1;
      continue;
    }

    summary.waitingForDays += 1;
  }

  return summary;
}
