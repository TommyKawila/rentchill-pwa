"use client";

import { useCallback, useEffect, useState } from "react";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";

type OverrideStatus = "idle" | "loading" | "saving" | "error";

export function useInvoiceOverride(propertySlug: string) {
  const [invoices, setInvoices] = useState<InvoiceOverrideRow[]>([]);
  const [status, setStatus] = useState<OverrideStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/override?property_slug=${encodeURIComponent(propertySlug)}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        invoices?: InvoiceOverrideRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดบิลไม่สำเร็จ");
      }

      setInvoices(payload.invoices ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดบิลไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateMeters = useCallback(
    async (invoiceId: string, waterUnit: number, electricUnit: number) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(`/api/override/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_meters",
            water_unit: waterUnit,
            electric_unit: electricUnit,
          }),
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "อัปเดตมิเตอร์ไม่สำเร็จ");
        }

        await load();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อัปเดตมิเตอร์ไม่สำเร็จ");
      }
    },
    [load],
  );

  const approveInvoice = useCallback(
    async (invoiceId: string, slipImageUrl?: string) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(`/api/override/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            slip_image_url: slipImageUrl || null,
          }),
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "อนุมัติบิลไม่สำเร็จ");
        }

        await load();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อนุมัติบิลไม่สำเร็จ");
      }
    },
    [load],
  );

  return {
    invoices,
    status,
    error,
    reload: load,
    updateMeters,
    approveInvoice,
  };
}
