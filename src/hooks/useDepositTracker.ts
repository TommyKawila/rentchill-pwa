"use client";

import { useCallback, useEffect, useState } from "react";
import type { TenantDepositRow, DepositStatus } from "@/services/depositService";
import { canUseDepositTracker } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

type DepositStatus_ui = "idle" | "loading" | "saving" | "error";

export function useDepositTracker(
  propertySlug: string,
  roomId: string,
  tenantId: string,
  planTier: PlanTier,
) {
  const [deposit, setDeposit] = useState<TenantDepositRow | null>(null);
  const [status, setStatus] = useState<DepositStatus_ui>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug || !roomId || !tenantId || !canUseDepositTracker(planTier)) {
      setDeposit(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const params = new URLSearchParams({ tenant_id: tenantId });
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/deposit?${params}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        deposit?: TenantDepositRow | null;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดไม่สำเร็จ");
      }

      setDeposit(payload.deposit ?? null);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    }
  }, [propertySlug, roomId, tenantId, planTier]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: { amount: number; status: DepositStatus; note?: string }) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/deposit`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_id: tenantId,
              amount: input.amount,
              status: input.status,
              note: input.note ?? null,
            }),
          },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          deposit?: TenantDepositRow;
        };

        if (!response.ok || !payload.ok || !payload.deposit) {
          throw new Error(payload.error ?? "บันทึกไม่สำเร็จ");
        }

        setDeposit(payload.deposit);
        setStatus("idle");
        return payload.deposit;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
        return null;
      }
    },
    [propertySlug, roomId, tenantId],
  );

  return { deposit, status, error, reload: load, save };
}
