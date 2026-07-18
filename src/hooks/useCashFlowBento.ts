"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  computeCashFlowBento,
  type CashFlowBentoMetrics,
} from "@/services/dashboardMetricsService";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";

export function useCashFlowBento(
  propertySlug: string,
  billingMonth: string,
  rows: MonthlyBillingRow[],
) {
  const [assetValue, setAssetValue] = useState<number | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!propertySlug || !billingMonth) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ billing_month: billingMonth });
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/bento-context?${params}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        assetValue?: number | null;
        monthlyExpenses?: number;
      };
      if (response.ok && payload.ok) {
        setAssetValue(payload.assetValue ?? null);
        setMonthlyExpenses(payload.monthlyExpenses ?? 0);
      }
    } catch (err) {
      console.error("[useCashFlowBento]", { propertySlug }, err);
    } finally {
      setLoading(false);
    }
  }, [propertySlug, billingMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics: CashFlowBentoMetrics = useMemo(
    () => computeCashFlowBento(rows, monthlyExpenses, assetValue),
    [rows, monthlyExpenses, assetValue],
  );

  return { metrics, loading, reload: load };
}
