"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";

type OverrideStatus = "idle" | "loading" | "saving" | "error";

export type OverrideSavingAction = "meters" | "approve" | "reject" | "verify" | null;

export type ApproveInvoiceInput = {
  slipUrl?: string;
  proofFile?: File;
  note?: string;
};

export function useInvoiceOverride(propertySlug: string) {
  const [invoices, setInvoices] = useState<InvoiceOverrideRow[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<InvoiceOverrideRow[]>([]);
  const [status, setStatus] = useState<OverrideStatus>("idle");
  const [savingAction, setSavingAction] = useState<OverrideSavingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const hasScanningInvoices = useMemo(
    () => invoices.some((inv) => inv.status === "scanning"),
    [invoices],
  );

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!propertySlug) return;

    const silent = options?.silent === true;
    if (!silent) {
      setStatus("loading");
    }
    setError(null);

    try {
      const response = await fetch(
        `/api/override?property_slug=${encodeURIComponent(propertySlug)}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        invoices?: InvoiceOverrideRow[];
        paidInvoices?: InvoiceOverrideRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดบิลไม่สำเร็จ");
      }

      setInvoices(payload.invoices ?? []);
      setPaidInvoices(payload.paidInvoices ?? []);
      if (!silent) setStatus("idle");
    } catch (err) {
      if (!silent) setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดบิลไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [propertySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!propertySlug || !hasScanningInvoices) return;

    const intervalId = window.setInterval(() => {
      void load({ silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [propertySlug, hasScanningInvoices, load]);

  useEffect(() => {
    if (!propertySlug) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: invoices.length > 0 });
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [propertySlug, load, invoices.length]);

  const updateMeters = useCallback(
    async (invoiceId: string, waterUnit: number, electricUnit: number) => {
      setStatus("saving");
      setSavingAction("meters");
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
      } finally {
        setSavingAction(null);
      }
    },
    [load],
  );

  const approveInvoice = useCallback(
    async (invoiceId: string, input?: ApproveInvoiceInput | string): Promise<boolean> => {
      setStatus("saving");
      setSavingAction("approve");
      setError(null);

      try {
        const options: ApproveInvoiceInput =
          typeof input === "string" ? { slipUrl: input } : input ?? {};

        let proofUrl: string | null = null;
        if (options.proofFile) {
          const formData = new FormData();
          formData.set("file", options.proofFile);
          const uploadRes = await fetch(
            `/api/override/${invoiceId}/payment-proof`,
            { method: "POST", body: formData },
          );
          const uploadPayload = (await uploadRes.json()) as {
            ok?: boolean;
            error?: string;
            proof_url?: string;
          };
          if (!uploadRes.ok || !uploadPayload.ok || !uploadPayload.proof_url) {
            throw new Error(uploadPayload.error ?? "อัปโหลดหลักฐานไม่สำเร็จ");
          }
          proofUrl = uploadPayload.proof_url;
        }

        const note = options.note?.trim().slice(0, 200) || null;

        const response = await fetch(`/api/override/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            slip_image_url: options.slipUrl || null,
            owner_payment_proof_url: proofUrl,
            owner_payment_note: note,
          }),
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "อนุมัติบิลไม่สำเร็จ");
        }

        await load();
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อนุมัติบิลไม่สำเร็จ");
        return false;
      } finally {
        setSavingAction(null);
      }
    },
    [load],
  );

  const verifySlipAuto = useCallback(
    async (invoiceId: string) => {
      setStatus("saving");
      setSavingAction("verify");
      setError(null);

      try {
        const response = await fetch(`/api/payments/${invoiceId}/verify`, {
          method: "POST",
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          verification?: { verified: boolean; message: string };
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "ตรวจสอบสลิปไม่สำเร็จ");
        }

        if (!payload.verification?.verified) {
          throw new Error(payload.verification?.message ?? "สลิปไม่ผ่านการตรวจสอบ");
        }

        await load();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ตรวจสอบสลิปไม่สำเร็จ");
      } finally {
        setSavingAction(null);
      }
    },
    [load],
  );

  const rejectSlip = useCallback(
    async (invoiceId: string, note?: string) => {
      setStatus("saving");
      setSavingAction("reject");
      setError(null);

      try {
        const response = await fetch(`/api/override/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", note }),
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "ปฏิเสธสลิปไม่สำเร็จ");
        }

        await load();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ปฏิเสธสลิปไม่สำเร็จ");
      } finally {
        setSavingAction(null);
      }
    },
    [load],
  );

  return {
    invoices,
    paidInvoices,
    status,
    savingAction,
    error,
    reload: load,
    updateMeters,
    approveInvoice,
    verifySlipAuto,
    rejectSlip,
  };
}
