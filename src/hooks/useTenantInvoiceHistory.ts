"use client";

import { useCallback, useEffect, useState } from "react";
import { getTenantInvoiceHistory } from "@/services/invoiceService";
import type { Invoice } from "@/services/types";

type HistoryStatus = "idle" | "loading" | "error";

export function useTenantInvoiceHistory(tenantId: string | null, enabled = true) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<HistoryStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId || !enabled) {
      setInvoices([]);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const rows = await getTenantInvoiceHistory(tenantId);
      setInvoices(rows);
      setStatus("idle");
    } catch (err) {
      console.error("[useTenantInvoiceHistory]", { tenantId }, err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดประวัติบิลไม่สำเร็จ");
    }
  }, [tenantId, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { invoices, status, error, reload: load };
}
