"use client";

import { useCallback, useState } from "react";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

type CreateStatus = "idle" | "creating" | "error";

export function useCreateProject() {
  const [status, setStatus] = useState<CreateStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (name: string, manualSlug?: string | null) => {
    setStatus("creating");
    setError(null);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(manualSlug ? { slug: manualSlug } : {}),
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        property?: OwnerPropertyOption;
      };

      if (!response.ok || !payload.ok || !payload.property) {
        if (payload.error === "PROJECT_LIMIT_EXCEEDED") {
          throw new Error("PROJECT_LIMIT_EXCEEDED");
        }
        throw new Error(payload.message ?? payload.error ?? "สร้างโครงการไม่สำเร็จ");
      }

      setStatus("idle");
      return payload.property;
    } catch (err) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "สร้างโครงการไม่สำเร็จ";
      setError(message);
      throw err;
    }
  }, []);

  return { create, status, error };
}
