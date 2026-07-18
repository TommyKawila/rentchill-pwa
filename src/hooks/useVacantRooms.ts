"use client";

import { useCallback, useEffect, useState } from "react";
import type { VacantRoomRow } from "@/services/vacantRoomService";

type VacantStatus = "idle" | "loading" | "error";

export function useVacantRooms(propertySlug: string) {
  const [rooms, setRooms] = useState<VacantRoomRow[]>([]);
  const [status, setStatus] = useState<VacantStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) {
      setRooms([]);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/vacant-rooms`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        rooms?: VacantRoomRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดห้องว่างไม่สำเร็จ");
      }

      setRooms(payload.rooms ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดห้องว่างไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rooms, status, error, reload: load };
}
