"use client";

import { useCallback, useEffect, useState } from "react";
import type { UpgradeTier } from "@/services/planTierService";
import type { OwnerSubscription } from "@/services/platformPaymentService";

type BillingStatus = "idle" | "loading" | "uploading" | "error";

type PaymentAccount = {
  prompt_pay: string;
  bank_account: string;
  receiver_name: string;
};

export function usePlatformBilling() {
  const [subscription, setSubscription] = useState<OwnerSubscription | null>(null);
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [status, setStatus] = useState<BillingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/billing/subscription");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        subscription?: OwnerSubscription;
        account?: PaymentAccount;
      };

      if (!response.ok || !payload.ok || !payload.subscription) {
        throw new Error(payload.error ?? "โหลดข้อมูลไม่สำเร็จ");
      }

      setSubscription(payload.subscription);
      setAccount(payload.account ?? null);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitSlip = useCallback(async (tier: UpgradeTier, file: File) => {
    setStatus("uploading");
    setError(null);
    setSubmitted(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("plan_requested", tier);

      const response = await fetch("/api/billing/submit", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "อัปโหลดสลิปไม่สำเร็จ");
      }

      setSubmitted(true);
      await load();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "อัปโหลดสลิปไม่สำเร็จ");
    }
  }, [load]);

  return {
    subscription,
    account,
    status,
    error,
    submitted,
    submitSlip,
    reload: load,
  };
}
