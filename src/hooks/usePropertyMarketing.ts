"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  PropertyMarketing,
  PropertyMarketingInput,
} from "@/services/propertyMarketingService";

type MarketingStatus = "idle" | "loading" | "saving" | "uploading" | "error";

export function usePropertyMarketing(propertySlug: string) {
  const [marketing, setMarketing] = useState<PropertyMarketing | null>(null);
  const [status, setStatus] = useState<MarketingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/marketing`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        marketing?: PropertyMarketing;
      };

      if (!response.ok || !payload.ok || !payload.marketing) {
        throw new Error(payload.error ?? "โหลดข้อมูลไม่สำเร็จ");
      }

      setMarketing(payload.marketing);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: PropertyMarketingInput) => {
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/marketing`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          marketing?: PropertyMarketing;
        };

        if (!response.ok || !payload.ok || !payload.marketing) {
          throw new Error(payload.error ?? "บันทึกไม่สำเร็จ");
        }

        setMarketing(payload.marketing);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
      }
    },
    [propertySlug],
  );

  const uploadGallery = useCallback(
    async (file: File) => {
      setStatus("uploading");
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/gallery`,
          { method: "POST", body: formData },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          marketing?: PropertyMarketing;
        };

        if (!response.ok || !payload.ok || !payload.marketing) {
          throw new Error(payload.message ?? payload.error ?? "อัปโหลดไม่สำเร็จ");
        }

        setMarketing(payload.marketing);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
      }
    },
    [propertySlug],
  );

  const removeGallery = useCallback(
    async (url: string) => {
      setStatus("uploading");
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}/gallery?url=${encodeURIComponent(url)}`,
          { method: "DELETE" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          marketing?: PropertyMarketing;
        };

        if (!response.ok || !payload.ok || !payload.marketing) {
          throw new Error(payload.error ?? "ลบรูปไม่สำเร็จ");
        }

        setMarketing(payload.marketing);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "ลบรูปไม่สำเร็จ");
      }
    },
    [propertySlug],
  );

  return {
    marketing,
    status,
    error,
    reload: load,
    save,
    uploadGallery,
    removeGallery,
  };
}
