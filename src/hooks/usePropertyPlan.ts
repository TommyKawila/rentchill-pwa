"use client";

import { useCallback, useEffect, useState } from "react";
import type { PropertyPlanUsage } from "@/services/planTierService";

type PlanStatus = "idle" | "loading" | "error";

export function usePropertyPlan(propertySlug: string) {
  const [plan, setPlan] = useState<PropertyPlanUsage | null>(null);
  const [status, setStatus] = useState<PlanStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/plan`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        plan?: PropertyPlanUsage;
      };

      if (!response.ok || !payload.ok || !payload.plan) {
        throw new Error(payload.error ?? "โหลดแผนไม่สำเร็จ");
      }

      setPlan(payload.plan);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดแผนไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const atLimit = plan ? plan.rooms_remaining <= 0 : false;

  return { plan, status, error, atLimit, reload: load };
}
