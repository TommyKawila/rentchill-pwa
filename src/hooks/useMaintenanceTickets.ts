"use client";

import { useCallback, useEffect, useState } from "react";
import type { MaintenanceTicketRow, MaintenanceTicketStatus } from "@/services/types";

export function useMaintenanceTickets(propertySlug: string) {
  const [tickets, setTickets] = useState<MaintenanceTicketRow[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const [listRes, countRes] = await Promise.all([
        fetch(`/api/properties/${encodeURIComponent(propertySlug)}/maintenance`),
        fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/maintenance?count=waiting`,
        ),
      ]);

      const listPayload = (await listRes.json()) as {
        ok?: boolean;
        error?: string;
        tickets?: MaintenanceTicketRow[];
      };
      const countPayload = (await countRes.json()) as {
        ok?: boolean;
        count?: number;
      };

      if (!listRes.ok || !listPayload.ok) {
        throw new Error(listPayload.error ?? "โหลดไม่สำเร็จ");
      }

      setTickets(listPayload.tickets ?? []);
      setWaitingCount(countPayload.count ?? 0);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = useCallback(
    async (ticketId: string, nextStatus: MaintenanceTicketStatus) => {
      if (!propertySlug) return false;

      setUpdatingId(ticketId);
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/maintenance`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket_id: ticketId, status: nextStatus }),
          },
        );

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          ticket?: MaintenanceTicketRow;
        };

        if (!response.ok || !payload.ok || !payload.ticket) {
          throw new Error(payload.error ?? "บันทึกไม่สำเร็จ");
        }

        setTickets((prev) =>
          prev.map((row) => (row.id === ticketId ? payload.ticket! : row)),
        );
        void load();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
        return false;
      } finally {
        setUpdatingId(null);
      }
    },
    [propertySlug, load],
  );

  return {
    tickets,
    waitingCount,
    status,
    updatingId,
    error,
    reload: load,
    updateStatus,
  };
}
