"use client";

import { useCallback, useState } from "react";

type BaselineStatus = "idle" | "saving" | "error";

export function useMeterBaseline(
  propertySlug: string,
  roomId: string,
  tenantId: string,
) {
  const [status, setStatus] = useState<BaselineStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (waterReading: number, electricReading: number) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/meter-readings`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_id: tenantId,
              water_reading: waterReading,
              electric_reading: electricReading,
            }),
          },
        );
        const payload = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "บันทึกไม่สำเร็จ");
        }

        setStatus("idle");
        return true;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
        return false;
      }
    },
    [propertySlug, roomId, tenantId],
  );

  return { status, error, save };
}
