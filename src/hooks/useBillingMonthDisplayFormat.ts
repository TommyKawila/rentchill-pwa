"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  BILLING_MONTH_FORMAT_STORAGE_KEY,
  formatBillingMonth,
  parseBillingMonthFormat,
  type BillingMonthDisplayFormat,
} from "@/services/billingMonthDisplayService";

export function useBillingMonthDisplayFormat() {
  const { locale } = useLocale();
  const [format, setFormatState] = useState<BillingMonthDisplayFormat>(
    parseBillingMonthFormat(null, locale),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFormatState(
      parseBillingMonthFormat(
        localStorage.getItem(BILLING_MONTH_FORMAT_STORAGE_KEY),
        locale,
      ),
    );
    setReady(true);
  }, [locale]);

  const setFormat = useCallback((next: BillingMonthDisplayFormat) => {
    setFormatState(next);
    localStorage.setItem(BILLING_MONTH_FORMAT_STORAGE_KEY, next);
  }, []);

  const formatMonth = useCallback(
    (iso: string) => formatBillingMonth(iso, format, locale),
    [format, locale],
  );

  return { format, setFormat, formatMonth, ready };
}
