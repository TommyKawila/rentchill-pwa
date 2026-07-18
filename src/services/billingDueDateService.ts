import type { Locale } from "@/services/i18n/messages";

const BANGKOK = "Asia/Bangkok";

function clampBillingDay(year: number, month: number, billingDay: number) {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(Math.max(billingDay, 1), lastDay);
}

export function dueDateFromBillingMonth(
  billingMonth: string,
  billingDay: number,
  locale: Locale = "th",
) {
  const [year, month] = billingMonth.split("-").map(Number);
  if (!year || !month) return null;

  const day = clampBillingDay(year, month, billingDay);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function bangkokYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
  };
}

/** Negative = before due, positive = overdue (Bangkok calendar days). */
export function daysRelativeToDue(
  billingMonth: string,
  billingDay: number,
  now = new Date(),
) {
  const [year, month] = billingMonth.split("-").map(Number);
  if (!year || !month) return null;

  const dueDay = clampBillingDay(year, month, billingDay);
  const dueUtc = Date.UTC(year, month - 1, dueDay);
  const today = bangkokYmd(now);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((todayUtc - dueUtc) / 86_400_000);
}

export function formatBangkokLocaleDate(
  input: string | Date,
  locale: Locale = "th",
) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    timeZone: BANGKOK,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Next cycle bill date on property billing_day (month after billingMonth when invoiced). */
export function nextBillCycleDate(
  billingMonth: string,
  billingDay: number,
  hasCurrentCycleInvoice: boolean,
  now = new Date(),
) {
  const [year, month] = billingMonth.split("-").map(Number);
  if (!year || !month) return null;

  if (!hasCurrentCycleInvoice) {
    const day = clampBillingDay(year, month, billingDay);
    const cycleUtc = Date.UTC(year, month - 1, day);
    const today = bangkokYmd(now);
    const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
    if (todayUtc <= cycleUtc) {
      return new Date(year, month - 1, day);
    }
  }

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const day = clampBillingDay(nextYear, nextMonth, billingDay);
  return new Date(nextYear, nextMonth - 1, day);
}

export function daysUntilBangkokDate(target: Date, now = new Date()) {
  const today = bangkokYmd(now);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const end = bangkokYmd(target);
  const targetUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((targetUtc - todayUtc) / 86_400_000);
}
