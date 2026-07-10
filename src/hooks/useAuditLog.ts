"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditLogRow } from "@/services/auditLogService";
import { canUseAuditLog } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

export function useAuditLog(propertySlug: string, planTier: PlanTier) {
  const [entries, setEntries] = useState<AuditLogRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug || !canUseAuditLog(planTier)) {
      setEntries([]);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/audit`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        entries?: AuditLogRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดไม่สำเร็จ");
      }

      setEntries(payload.entries ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    }
  }, [propertySlug, planTier]);

  useEffect(() => {
    void load();
  }, [load]);

  return { entries, status, error, reload: load };
}
