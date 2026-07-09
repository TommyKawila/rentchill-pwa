"use client";

import { useCallback, useState } from "react";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

type ManageStatus = "idle" | "renaming" | "deleting" | "error";

export function useProjectManage(propertySlug: string) {
  const [status, setStatus] = useState<ManageStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const rename = useCallback(
    async (name: string) => {
      if (!propertySlug) throw new Error("ไม่พบโครงการ");

      setStatus("renaming");
      setError(null);

      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertySlug)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          },
        );

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          property?: OwnerPropertyOption;
          slug_changed?: boolean;
          previous_slug?: string;
        };

        if (!response.ok || !payload.ok || !payload.property) {
          throw new Error(payload.error ?? "แก้ชื่อไม่สำเร็จ");
        }

        setStatus("idle");
        return {
          property: payload.property,
          slugChanged: Boolean(payload.slug_changed),
          previousSlug: payload.previous_slug ?? propertySlug,
        };
      } catch (err) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "แก้ชื่อไม่สำเร็จ";
        setError(message);
        throw err;
      }
    },
    [propertySlug],
  );

  const remove = useCallback(async () => {
    if (!propertySlug) throw new Error("ไม่พบโครงการ");

    setStatus("deleting");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}`,
        { method: "DELETE" },
      );

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        deleted?: boolean;
      };

      if (!response.ok || !payload.ok || !payload.deleted) {
        throw new Error(payload.error ?? "ลบโครงการไม่สำเร็จ");
      }

      setStatus("idle");
      return true;
    } catch (err) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "ลบโครงการไม่สำเร็จ";
      setError(message);
      throw err;
    }
  }, [propertySlug]);

  return { rename, remove, status, error };
}
