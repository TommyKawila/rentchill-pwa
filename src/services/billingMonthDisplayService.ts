import type { Locale } from "@/services/i18n/messages";

export type BillingMonthDisplayFormat = "thaiBe" | "thaiCe" | "iso";

export const BILLING_MONTH_FORMAT_STORAGE_KEY = "rentchill_billing_month_format";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const VALID_FORMATS: BillingMonthDisplayFormat[] = ["thaiBe", "thaiCe", "iso"];

export function parseBillingMonth(iso: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export function defaultBillingMonthFormat(locale: Locale): BillingMonthDisplayFormat {
  return locale === "th" ? "thaiBe" : "iso";
}

export function parseBillingMonthFormat(
  raw: string | null,
  locale: Locale,
): BillingMonthDisplayFormat {
  if (raw && VALID_FORMATS.includes(raw as BillingMonthDisplayFormat)) {
    return raw as BillingMonthDisplayFormat;
  }
  return defaultBillingMonthFormat(locale);
}

export function formatBillingMonth(
  iso: string,
  format: BillingMonthDisplayFormat,
  locale: Locale = "th",
): string {
  const parsed = parseBillingMonth(iso);
  if (!parsed) return iso;

  const { year, month } = parsed;
  const monthIndex = month - 1;

  if (format === "iso") return iso;

  if (format === "thaiCe") {
    return `${THAI_MONTHS[monthIndex]} ${year}`;
  }

  if (format === "thaiBe") {
    return `${THAI_MONTHS[monthIndex]} ${year + 543}`;
  }

  return `${ENGLISH_MONTHS[monthIndex]} ${year}`;
}
