"use client";

import { useCallback, useEffect, useState } from "react";
import type { PropertyQuota } from "@/services/propertyQuotaService";

type ExportStatus = "idle" | "loading" | "exporting" | "error";

export function useCsvExport(propertySlug: string) {
  const [quota, setQuota] = useState<PropertyQuota | null>(null);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/billing/quota?property_slug=${encodeURIComponent(propertySlug)}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        quota?: PropertyQuota;
      };

      if (!response.ok || !payload.ok || !payload.quota) {
        throw new Error(payload.error ?? "โหลดโควต้าไม่สำเร็จ");
      }

      setQuota(payload.quota);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดโควต้าไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = useCallback(async () => {
    setStatus("exporting");
    setError(null);

    try {
      const response = await fetch(
        `/api/billing/export?property_slug=${encodeURIComponent(propertySlug)}`,
      );

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: string;
          message?: string;
        };
        if (payload.error === "QUOTA_EXCEEDED") throw new Error("QUOTA_EXCEEDED");
        if (payload.error === "NO_DATA") throw new Error("NO_DATA");
        throw new Error(payload.message ?? payload.error ?? "ส่งออก CSV ไม่สำเร็จ");
      }

      const blob = await response.blob();
      const filename =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ??
        `rentchill-${propertySlug}.csv`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);

      await load();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "ส่งออก CSV ไม่สำเร็จ");
    }
  }, [propertySlug, load]);

  const canExport =
    quota?.csv_limit === null || (quota?.csv_remaining ?? 0) > 0;

  return { quota, status, error, canExport, reload: load, exportCsv };
}
