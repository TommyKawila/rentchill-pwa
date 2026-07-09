"use client";

import { useCallback, useEffect, useState } from "react";
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
  include_utilities: true,
};

export function useMonthlyBilling(propertySlug: string) {
  const [rows, setRows] = useState<MonthlyBillingRow[]>([]);
  const [billingMonth, setBillingMonth] = useState("");
  const [settings, setSettings] =
    useState<PropertyBillingSettings>(defaultSettings);
  const [status, setStatus] = useState<BillingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BillingResult | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
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
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = useCallback(
    async (entries: BillingEntry[]) => {
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
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ออกบิลไม่สำเร็จ");
      }
    },
    [propertySlug, load],
  );

  return {
    rows,
    billingMonth,
    settings,
    status,
    error,
    result,
    reload: load,
    generate,
  };
}
