"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildMeterHistoryRows,
  type MeterHistoryMonthRow,
} from "@/services/meterReadingService";

export function useMeterHistory(
  propertySlug: string,
  roomId: string,
  enabled = true,
) {
  const [rows, setRows] = useState<MeterHistoryMonthRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const reload = useCallback(async () => {
    if (!propertySlug || !roomId) return;
    setStatus("loading");
    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/meter-readings`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        rows?: MeterHistoryMonthRow[];
      };
      if (!response.ok || !payload.ok || !payload.rows) {
        throw new Error("load failed");
      }
      setRows(payload.rows);
      setStatus("idle");
    } catch {
      setRows([]);
      setStatus("error");
    }
  }, [propertySlug, roomId]);

  useEffect(() => {
    if (!enabled) return;
    void reload();
  }, [enabled, reload]);

  return { rows, status, reload };
}
