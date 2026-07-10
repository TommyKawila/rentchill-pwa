"use client";

import { useCallback, useEffect, useState } from "react";
import type { MeterPhotoRow, MeterUtilityType } from "@/services/meterPhotoService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { canUploadMeterPhoto } from "@/services/planLimits";

type MeterPhotoStatus = "idle" | "loading" | "uploading" | "error";

export function useMeterPhotos(
  propertySlug: string,
  roomId: string,
  billingMonth: string,
  planTier: PlanTier,
  tenantId?: string | null,
) {
  const [photos, setPhotos] = useState<MeterPhotoRow[]>([]);
  const [status, setStatus] = useState<MeterPhotoStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug || !roomId) return;

    setStatus("loading");
    setError(null);

    try {
      const params = new URLSearchParams({ billing_month: billingMonth });
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/meter-photos?${params}`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        photos?: MeterPhotoRow[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดรูปไม่สำเร็จ");
      }

      setPhotos(payload.photos ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดรูปไม่สำเร็จ");
    }
  }, [propertySlug, roomId, billingMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = useCallback(
    async (utilityType: MeterUtilityType, file: File) => {
      if (!canUploadMeterPhoto(planTier)) {
        setError("แผนนี้ไม่รองรับรูปมิเตอร์");
        return null;
      }

      setStatus("uploading");
      setError(null);

      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("utility_type", utilityType);
        formData.set("billing_month", billingMonth);
        if (tenantId) formData.set("tenant_id", tenantId);

        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/rooms/${encodeURIComponent(roomId)}/meter-photos`,
          { method: "POST", body: formData },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          photo?: MeterPhotoRow;
        };

        if (!response.ok || !payload.ok || !payload.photo) {
          throw new Error(payload.error ?? "อัปโหลดไม่สำเร็จ");
        }

        setPhotos((prev) => [payload.photo!, ...prev]);
        setStatus("idle");
        return payload.photo;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
        return null;
      }
    },
    [propertySlug, roomId, billingMonth, planTier, tenantId],
  );

  return { photos, status, error, reload: load, upload };
}
