import type { Locale } from "@/services/i18n/messages";

const CURRENCY_SYMBOL: Record<string, string> = {
  THB: "฿",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const LOCALE_TAG: Record<Locale, string> = {
  th: "th-TH",
  en: "en-US",
};

export function currencySymbol(currency = "THB"): string {
  return CURRENCY_SYMBOL[currency.toUpperCase()] ?? currency.toUpperCase();
}

export function formatMoney(
  amount: number,
  currency = "THB",
  locale: Locale = "th",
): string {
  const code = currency.toUpperCase();
  const tag = LOCALE_TAG[locale];
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencySymbol(code)}${amount.toLocaleString(tag)}`;
  }
}

export function formatMoneyAmount(
  amount: number,
  locale: Locale = "th",
): string {
  return amount.toLocaleString(LOCALE_TAG[locale], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
