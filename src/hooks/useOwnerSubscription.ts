"use client";

import { useCallback, useEffect, useState } from "react";
import type { OwnerSubscription } from "@/services/platformPaymentService";

type SubscriptionStatus = "idle" | "loading" | "error";

export function useOwnerSubscription() {
  const [subscription, setSubscription] = useState<OwnerSubscription | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/billing/subscription");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        subscription?: OwnerSubscription;
      };

      if (!response.ok || !payload.ok || !payload.subscription) {
        throw new Error(payload.error ?? "โหลดข้อมูลไม่สำเร็จ");
      }

      setSubscription(payload.subscription);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { subscription, status, error, reload: load };
}
