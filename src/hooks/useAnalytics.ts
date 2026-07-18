"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AnalyticsReport,
  AnalyticsTimeframe,
} from "@/services/analyticsCashflowService";

type AnalyticsStatus = "idle" | "loading" | "exporting" | "error";

export function useAnalytics(filters: {
  timeframe: AnalyticsTimeframe;
  propertySlug: string;
  roomId: string;
}) {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [status, setStatus] = useState<AnalyticsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const params = new URLSearchParams({ timeframe: filters.timeframe });
      if (filters.propertySlug && filters.propertySlug !== "portfolio") {
        params.set("property_slug", filters.propertySlug);
      } else {
        params.set("property_slug", "portfolio");
      }
      if (filters.roomId) params.set("room_id", filters.roomId);

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        report?: AnalyticsReport;
      };

      if (!response.ok || !payload.ok || !payload.report) {
        throw new Error(payload.error ?? "โหลดรายงานไม่สำเร็จ");
      }

      setReport(payload.report);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดรายงานไม่สำเร็จ");
    }
  }, [filters.timeframe, filters.propertySlug, filters.roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportExcel = useCallback(async () => {
    setStatus("exporting");
    setError(null);

    try {
      const params = new URLSearchParams({ timeframe: filters.timeframe });
      if (filters.propertySlug && filters.propertySlug !== "portfolio") {
        params.set("property_slug", filters.propertySlug);
      } else {
        params.set("property_slug", "portfolio");
      }
      if (filters.roomId) params.set("room_id", filters.roomId);

      const response = await fetch(`/api/analytics/export?${params.toString()}`);
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "ส่งออกไม่สำเร็จ");
      }

      const blob = await response.blob();
      const filename =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ?? "rentchill-analytics.xlsx";

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "ส่งออกไม่สำเร็จ");
    }
  }, [filters.timeframe, filters.propertySlug, filters.roomId]);

  return { report, status, error, reload: load, exportExcel };
}
