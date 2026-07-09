"use client";

import { useCallback, useEffect, useState } from "react";
import type { PropertyQuota } from "@/services/propertyQuotaService";

type ReminderStatus = "idle" | "loading" | "sending" | "error";

export function usePaymentReminder(propertySlug: string) {
  const [quota, setQuota] = useState<PropertyQuota | null>(null);
  const [status, setStatus] = useState<ReminderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRemindedTenantId, setLastRemindedTenantId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/billing/quota?property_slug=${encodeURIComponent(propertySlug)}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        quota?: PropertyQuota;
      };

      if (!response.ok || !payload.ok || !payload.quota) {
        throw new Error(payload.error ?? "โหลดโควต้าไม่สำเร็จ");
      }

      setQuota(payload.quota);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดโควต้าไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const remind = useCallback(
    async (tenantId: string) => {
      setStatus("sending");
      setError(null);
      setLastRemindedTenantId(null);

      try {
        const response = await fetch("/api/billing/remind", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_slug: propertySlug,
            tenant_id: tenantId,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          tenant_name?: string;
          quota?: PropertyQuota;
        };

        if (!response.ok || !payload.ok) {
          if (payload.error === "QUOTA_EXCEEDED") {
            throw new Error("QUOTA_EXCEEDED");
          }
          throw new Error(payload.message ?? payload.error ?? "ส่งแจ้งเตือนไม่สำเร็จ");
        }

        setQuota(payload.quota ?? null);
        setLastRemindedTenantId(tenantId);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ส่งแจ้งเตือนไม่สำเร็จ");
      }
    },
    [propertySlug],
  );

  const canRemind = (quota?.line_push_remaining ?? 0) > 0;

  return {
    quota,
    status,
    error,
    lastRemindedTenantId,
    canRemind,
    reload: load,
    remind,
  };
}
