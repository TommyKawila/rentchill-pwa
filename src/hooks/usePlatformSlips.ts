"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlatformPaymentRow } from "@/services/platformPaymentService";

type SlipsStatus = "idle" | "loading" | "approving" | "error";

export function usePlatformSlips() {
  const [payments, setPayments] = useState<PlatformPaymentRow[]>([]);
  const [status, setStatus] = useState<SlipsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/admin/platform-payments");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        payments?: PlatformPaymentRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดรายการไม่สำเร็จ");
      }

      setPayments(payload.payments ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดรายการไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = useCallback(
    async (paymentId: string) => {
      setStatus("approving");
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/platform-payments/${paymentId}/approve`,
          { method: "POST" },
        );
        const payload = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "อนุมัติไม่สำเร็จ");
        }

        await load();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อนุมัติไม่สำเร็จ");
      }
    },
    [load],
  );

  return { payments, status, error, approve, reload: load };
}
