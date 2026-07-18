import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

const BANGKOK = "Asia/Bangkok";

export type PropertyBillingSettings = {
  billing_day: number;
  meter_reminder_days_before: number;
  reminder_soft_days: number;
  reminder_firm_days: number;
  reminder_final_days: number;
  include_utilities: boolean;
  water_rate_per_unit: number;
  electric_rate_per_unit: number;
};

export function getBangkokDayOfMonth(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK,
    day: "numeric",
  });
  return Number(formatter.format(date));
}

export function getBangkokDaysInMonth(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK,
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  return new Date(year, month, 0).getDate();
}

export function isInMeterReminderWindow(
  billingDay: number,
  reminderDaysBefore: number,
  date = new Date(),
) {
  const today = getBangkokDayOfMonth(date);
  const windowStart = billingDay - reminderDaysBefore;

  if (windowStart >= 1) {
    return today >= windowStart && today <= billingDay;
  }

  const daysInMonth = getBangkokDaysInMonth(date);
  const spillDays = reminderDaysBefore - billingDay;
  const lateMonthStart = daysInMonth - spillDays + 1;
  return today >= lateMonthStart || today <= billingDay;
}

export function isMeterInputComplete(water: string, electric: string) {
  if (water.trim() === "" || electric.trim() === "") return false;
  const w = Number(water);
  const e = Number(electric);
  return Number.isFinite(w) && w >= 0 && Number.isFinite(e) && e >= 0;
}

export function isElectricDialComplete(electric: string) {
  if (electric.trim() === "") return false;
  const value = Number(electric);
  return Number.isFinite(value) && value >= 0;
}

export function isMeterDialComplete(water: string, electric: string) {
  return isMeterInputComplete(water, electric);
}

export function hasMeterBaseline(row: MonthlyBillingRow) {
  return Boolean(row.water_prev && row.electric_prev);
}

export function clampBillingDay(value: number) {
  return Math.min(28, Math.max(1, Math.round(value)));
}

export function clampReminderDays(value: number) {
  return Math.min(7, Math.max(1, Math.round(value)));
}

export function clampUtilityRate(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(999, Math.round(value * 100) / 100);
}

export function isRowEditable(row: MonthlyBillingRow) {
  return !row.invoice_id;
}

export function isMeterEntryLocked(row: MonthlyBillingRow) {
  return !isRowEditable(row);
}

export function isRowReadyToBill(
  row: MonthlyBillingRow,
  meters: { water: string; electric: string },
  includeUtilities: boolean,
  options?: { waterFlatBaht?: number },
) {
  if (!isRowEditable(row)) return false;
  if (!includeUtilities) return true;
  if (!row.electric_prev) return false;
  if (!isElectricDialComplete(meters.electric)) return false;
  const water = options?.waterFlatBaht ?? 0;
  return Number.isFinite(water) && water >= 0;
}

export function computeBillingReadiness(
  rows: MonthlyBillingRow[],
  meters: Record<string, { water: string; electric: string }>,
  includeUtilities: boolean,
) {
  let readyCount = 0;
  let pendingMeterCount = 0;

  for (const row of rows) {
    if (row.invoice_id) continue;
    if (!isRowEditable(row)) continue;

    const rowMeters = meters[row.tenant_id] ?? { water: "", electric: "" };
    if (isRowReadyToBill(row, rowMeters, includeUtilities)) {
      readyCount++;
    } else {
      pendingMeterCount++;
    }
  }

  return { readyCount, pendingMeterCount };
}
