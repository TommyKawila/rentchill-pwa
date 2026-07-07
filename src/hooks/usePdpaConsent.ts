"use client";

import { useCallback, useState } from "react";

type ConsentStatus = "idle" | "submitting" | "error";

export function usePdpaConsent() {
  const [status, setStatus] = useState<ConsentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const acceptConsent = useCallback(async (tenantId: string) => {
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch(`/api/tenants/${tenantId}/consent`, {
        method: "POST",
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "บันทึกความยินยอมไม่สำเร็จ");
      }

      setStatus("idle");
      return true;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "บันทึกความยินยอมไม่สำเร็จ");
      return false;
    }
  }, []);

  return { status, error, acceptConsent };
}
