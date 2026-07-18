"use client";

import { useCallback, useState } from "react";
import type { MessageKey } from "@/services/i18n/messages";

type LifecycleStatus = "idle" | "saving" | "error";

type QuotaSnapshot = {
  room_count: number;
  room_limit: number;
  rooms_remaining: number;
};

export function useMoveOutTenant(propertySlug: string) {
  const [status, setStatus] = useState<LifecycleStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

  const moveOut = useCallback(
    async (roomId: string) => {
      setStatus("saving");
      setError(null);
      setErrorKey(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/move-out`,
          { method: "POST" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          messageKey?: MessageKey | null;
          quota?: QuotaSnapshot;
        };

        if (!response.ok || !payload.ok) {
          setErrorKey(payload.messageKey ?? null);
          throw new Error(payload.error ?? "MOVE_OUT_FAILED");
        }

        setStatus("idle");
        return payload.quota ?? null;
      } catch (err) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "MOVE_OUT_FAILED";
        setError(message);
        throw err;
      }
    },
    [propertySlug],
  );

  return { moveOut, status, error, errorKey, clearError: () => setError(null) };
}

export function useDeleteVacantRoom(propertySlug: string) {
  const [status, setStatus] = useState<LifecycleStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

  const remove = useCallback(
    async (roomId: string) => {
      setStatus("saving");
      setError(null);
      setErrorKey(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}`,
          { method: "DELETE" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          messageKey?: MessageKey | null;
          quota?: QuotaSnapshot;
        };

        if (!response.ok || !payload.ok) {
          setErrorKey(payload.messageKey ?? null);
          throw new Error(payload.error ?? "DELETE_ROOM_FAILED");
        }

        setStatus("idle");
        return payload.quota ?? null;
      } catch (err) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "DELETE_ROOM_FAILED";
        setError(message);
        throw err;
      }
    },
    [propertySlug],
  );

  return { remove, status, error, errorKey, clearError: () => setError(null) };
}

export type AssignVacantTenantInput = {
  tenant_name: string;
  phone_number: string;
  base_rent_price: number;
  move_in_date: string;
  water_reading: number;
  electric_reading: number;
};

export function useAssignVacantRoomTenant(propertySlug: string) {
  const [status, setStatus] = useState<LifecycleStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

  const assign = useCallback(
    async (roomId: string, input: AssignVacantTenantInput) => {
      setStatus("saving");
      setError(null);
      setErrorKey(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/assign-tenant`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          messageKey?: MessageKey | null;
          result?: { tenant_id: string };
        };

        if (!response.ok || !payload.ok || !payload.result) {
          setErrorKey(payload.messageKey ?? null);
          throw new Error(payload.message ?? payload.error ?? "ASSIGN_TENANT_FAILED");
        }

        setStatus("idle");
        return payload.result;
      } catch (err) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "ASSIGN_TENANT_FAILED";
        setError(message);
        throw err;
      }
    },
    [propertySlug],
  );

  return { assign, status, error, errorKey, clearError: () => setError(null) };
}
