"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  MaintenanceTicketCategory,
  MaintenanceTicketRow,
} from "@/services/types";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function useTenantMaintenance(tenantId: string | null) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    category?: string;
    description?: string;
    media?: string;
  }>({});
  const [tickets, setTickets] = useState<MaintenanceTicketRow[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const reloadTickets = useCallback(async () => {
    if (!tenantId) {
      setTickets([]);
      return;
    }

    setTicketsLoading(true);
    try {
      const response = await fetch(
        `/api/tenant/maintenance?tenant_id=${encodeURIComponent(tenantId)}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        tickets?: MaintenanceTicketRow[];
      };

      if (response.ok && payload.tickets) {
        setTickets(payload.tickets);
      }
    } finally {
      setTicketsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void reloadTickets();
  }, [reloadTickets]);

  const submit = useCallback(
    async (input: {
      category: MaintenanceTicketCategory | "";
      description: string;
      media: File | null;
    }) => {
      const nextFieldErrors: typeof fieldErrors = {};

      if (!input.category) {
        nextFieldErrors.category = "กรุณาเลือกหมวดปัญหา";
      }
      if (input.description.trim().length < 3) {
        nextFieldErrors.description = "กรุณาอธิบายปัญหาสั้นๆ อย่างน้อย 3 ตัวอักษร";
      }
      if (
        input.media &&
        !input.media.type.startsWith("image/") &&
        !input.media.type.startsWith("video/")
      ) {
        nextFieldErrors.media = "รองรับเฉพาะรูปภาพหรือวิดีโอ";
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        return false;
      }

      if (!tenantId || !input.category) return false;

      setStatus("submitting");
      setError(null);
      setFieldErrors({});

      try {
        const formData = new FormData();
        formData.set("tenant_id", tenantId);
        formData.set("category", input.category);
        formData.set("description", input.description.trim());
        if (input.media) formData.set("media", input.media);

        const response = await fetch("/api/tenant/maintenance", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "ส่งเรื่องไม่สำเร็จ");
        }

        setStatus("success");
        void reloadTickets();
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ส่งเรื่องไม่สำเร็จ");
        return false;
      }
    },
    [tenantId, reloadTickets],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setFieldErrors({});
  }, []);

  return {
    status,
    error,
    fieldErrors,
    tickets,
    ticketsLoading,
    submit,
    reset,
    reloadTickets,
  };
}
