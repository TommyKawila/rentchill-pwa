"use client";

import { useCallback, useEffect, useState } from "react";
import type { PropertyPaymentAccount, PropertyPaymentInput } from "@/services/types";

type SettingsStatus = "idle" | "loading" | "saving" | "error";

export function usePropertyPaymentSettings(propertySlug: string) {
  const [account, setAccount] = useState<PropertyPaymentAccount | null>(null);
  const [status, setStatus] = useState<SettingsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/payment`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        account?: PropertyPaymentAccount;
      };

      if (!response.ok || !payload.ok || !payload.account) {
        throw new Error(payload.error ?? "โหลดข้อมูลไม่สำเร็จ");
      }

      setAccount(payload.account);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: PropertyPaymentInput): Promise<boolean> => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/payment`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          },
        );

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          account?: PropertyPaymentAccount;
        };

        if (!response.ok || !payload.ok || !payload.account) {
          throw new Error(payload.error ?? "บันทึกไม่สำเร็จ");
        }

        setAccount(payload.account);
        setStatus("idle");
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
        return false;
      }
    },
    [propertySlug],
  );

  return { account, status, error, reload: load, save };
}
