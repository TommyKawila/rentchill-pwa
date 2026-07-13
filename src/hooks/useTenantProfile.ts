"use client";

import { useCallback, useState } from "react";
import type { TenantProfileResult } from "@/services/tenantProfileService";

type ProfileStatus = "idle" | "saving" | "error";

export function useTenantProfile(propertySlug: string, tenantId: string) {
  const [status, setStatus] = useState<ProfileStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (input: { tenant_name: string }) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(
          `/api/tenants/${encodeURIComponent(tenantId)}/profile`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              property_slug: propertySlug,
              tenant_name: input.tenant_name,
            }),
          },
        );

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          result?: TenantProfileResult;
        };

        if (!response.ok || !payload.ok || !payload.result) {
          throw new Error(payload.message ?? payload.error ?? "บันทึกไม่สำเร็จ");
        }

        setStatus("idle");
        return payload.result;
      } catch (err) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "บันทึกไม่สำเร็จ";
        setError(message);
        return null;
      }
    },
    [propertySlug, tenantId],
  );

  return { save, status, error, clearError: () => setError(null) };
}
