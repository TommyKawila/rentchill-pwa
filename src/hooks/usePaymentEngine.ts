"use client";

import { useCallback, useState } from "react";
import type { Invoice } from "@/services/types";

type PaymentStatus = "idle" | "uploading" | "success" | "error";

export function usePaymentEngine() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submitSlip = useCallback(
    async (invoiceId: string, tenantId: string, file: File): Promise<Invoice | null> => {
      setStatus("uploading");
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tenant_id", tenantId);

        const response = await fetch(`/api/payments/${invoiceId}`, {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          invoice?: Invoice;
        };

        if (!response.ok || !payload.ok || !payload.invoice) {
          throw new Error(payload.error ?? "อัปโหลดสลิปไม่สำเร็จ");
        }

        setStatus("success");
        return payload.invoice;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อัปโหลดสลิปไม่สำเร็จ");
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, submitSlip, reset };
}
