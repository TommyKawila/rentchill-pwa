"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlanTier } from "@/services/propertyQuotaService";

export type TrialStatus = {
  enabled: boolean;
  plan_tier?: PlanTier;
  property_slug?: string;
  tenant_invite_code?: string;
  reset_at?: string | null;
  reset_expires_at?: string;
};

export function useTrialStatus() {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trial/status");
      const payload = (await response.json()) as TrialStatus & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to load trial status");
      setStatus(payload);
    } catch (err) {
      setStatus({ enabled: false });
      setError(err instanceof Error ? err.message : "Failed to load trial status");
    } finally {
      setLoading(false);
    }
  }, []);

  const setPlan = useCallback(async (plan: PlanTier) => {
    setSwitching(true);
    setError(null);
    try {
      const response = await fetch("/api/trial/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to switch plan");
      }
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch plan");
      return false;
    } finally {
      setSwitching(false);
    }
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    status,
    loading,
    switching,
    error,
    reload: load,
    setPlan,
    isTrial: Boolean(status?.enabled),
  };
}
