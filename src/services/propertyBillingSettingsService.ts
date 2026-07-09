import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

const BANGKOK = "Asia/Bangkok";

export type PropertyBillingSettings = {
  billing_day: number;
  meter_reminder_days_before: number;
  include_utilities: boolean;
};

export function getBangkokDayOfMonth(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK,
    day: "numeric",
  });
  return Number(formatter.format(date));
}

export function isInMeterReminderWindow(
  billingDay: number,
  reminderDaysBefore: number,
  date = new Date(),
) {
  const today = getBangkokDayOfMonth(date);
  const windowStart = Math.max(1, billingDay - reminderDaysBefore);
  return today >= windowStart && today <= billingDay;
}

export function isMeterInputComplete(water: string, electric: string) {
  if (water.trim() === "" || electric.trim() === "") return false;
  const w = Number(water);
  const e = Number(electric);
  return Number.isFinite(w) && w >= 0 && Number.isFinite(e) && e >= 0;
}

export function clampBillingDay(value: number) {
  return Math.min(28, Math.max(1, Math.round(value)));
}

export function clampReminderDays(value: number) {
  return Math.min(7, Math.max(1, Math.round(value)));
}

export function isRowEditable(row: MonthlyBillingRow) {
  return row.invoice_status !== "paid" && row.invoice_status !== "scanning";
}

export function isRowReadyToBill(
  row: MonthlyBillingRow,
  meters: { water: string; electric: string },
  includeUtilities: boolean,
) {
  if (!isRowEditable(row)) return false;
  if (!includeUtilities) return true;
  return isMeterInputComplete(meters.water, meters.electric);
}
