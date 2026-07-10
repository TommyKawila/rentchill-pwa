"use client";

import { useCallback, useState } from "react";
import { canGenerateContractPdf } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

type ContractStatus = "idle" | "loading" | "error";

export function useLeaseContract(
  propertySlug: string,
  roomId: string,
  tenantId: string,
  planTier: PlanTier,
) {
  const [status, setStatus] = useState<ContractStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!canGenerateContractPdf(planTier)) {
      setError("แผนนี้ไม่รองรับสัญญา PDF");
      return false;
    }

    setStatus("loading");
    setError(null);

    try {
      const params = new URLSearchParams({ tenant_id: tenantId });
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/contract?${params}`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        html?: string;
      };

      if (!response.ok || !payload.ok || !payload.html) {
        throw new Error(payload.error ?? "สร้างสัญญาไม่สำเร็จ");
      }

      const blob = new Blob([payload.html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `lease-${roomId}.html`;
      anchor.click();
      URL.revokeObjectURL(url);

      setStatus("idle");
      return true;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "สร้างสัญญาไม่สำเร็จ");
      return false;
    }
  }, [propertySlug, roomId, tenantId, planTier]);

  return { status, error, generate };
}
