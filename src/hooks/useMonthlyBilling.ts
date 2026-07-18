"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropertyBillingSettings } from "@/services/propertyBillingSettingsService";
import type {
  BillingEntry,
  MonthlyBillingRow,
} from "@/services/monthlyBillingService";

type BillingStatus = "idle" | "loading" | "saving" | "error";

type BillingResult = {
  billingMonth: string;
  created: number;
  updated: number;
  skipped: number;
};

const defaultSettings: PropertyBillingSettings = {
  billing_day: 1,
  meter_reminder_days_before: 3,
  reminder_soft_days: 1,
  reminder_firm_days: 3,
  reminder_final_days: 7,
  include_utilities: true,
  water_billing_mode: "flat",
  water_flat_baht: 0,
  water_rate_per_unit: 10,
  electric_rate_per_unit: 7,
};

export function useMonthlyBilling(propertySlug: string) {
  const [rows, setRows] = useState<MonthlyBillingRow[]>([]);
  const [billingMonth, setBillingMonth] = useState("");
  const [settings, setSettings] =
    useState<PropertyBillingSettings>(defaultSettings);
  const [status, setStatus] = useState<BillingStatus>("idle");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BillingResult | null>(null);

  const hasScanningRows = useMemo(
    () => rows.some((row) => row.invoice_status === "scanning"),
    [rows],
  );

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!propertySlug) return;

      const silent = options?.silent === true;
      if (silent) {
        setIsRefreshing(true);
      } else {
        setStatus("loading");
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/billing?property_slug=${encodeURIComponent(propertySlug)}`,
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          billingMonth?: string;
          rows?: MonthlyBillingRow[];
          settings?: PropertyBillingSettings;
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "โหลดข้อมูลไม่สำเร็จ");
        }

        setBillingMonth(payload.billingMonth ?? "");
        setRows(payload.rows ?? []);
        setSettings(payload.settings ?? defaultSettings);
        if (!silent) setStatus("idle");
      } catch (err) {
        if (!silent) setStatus("error");
        setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (silent) setIsRefreshing(false);
        else setStatus((prev) => (prev === "saving" ? prev : "idle"));
      }
    },
    [propertySlug],
  );

  useEffect(() => {
    void load();
  }, [propertySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!propertySlug || !hasScanningRows) return;

    const intervalId = window.setInterval(() => {
      void load({ silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [propertySlug, hasScanningRows, load]);

  useEffect(() => {
    if (!propertySlug) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: rows.length > 0 });
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [propertySlug, load, rows.length]);

  const generate = useCallback(
    async (
      entries: BillingEntry[],
      options?: { deferLineNotify?: boolean },
    ): Promise<boolean> => {
      setStatus("saving");
      setError(null);
      setResult(null);

      try {
        const response = await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_slug: propertySlug,
            entries,
            defer_line_notify: options?.deferLineNotify === true,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          result?: BillingResult;
        };

        if (!response.ok || !payload.ok || !payload.result) {
          if (payload.error === "METER_REQUIRED") {
            throw new Error("METER_REQUIRED");
          }
          throw new Error(payload.message ?? payload.error ?? "ออกบิลไม่สำเร็จ");
        }

        setResult(payload.result);
        await load();
        setStatus("idle");
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ออกบิลไม่สำเร็จ");
        return false;
      }
    },
    [propertySlug, load],
  );

  return {
    rows,
    billingMonth,
    settings,
    status,
    isRefreshing,
    hasScanningRows,
    error,
    result,
    reload: load,
    generate,
  };
}
