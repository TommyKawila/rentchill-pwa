"use client";

import { useCallback, useEffect, useState } from "react";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

type PropertiesStatus = "idle" | "loading" | "error";

export function useOwnerProperties() {
  const [properties, setProperties] = useState<OwnerPropertyOption[]>([]);
  const [status, setStatus] = useState<PropertiesStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/properties");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        properties?: OwnerPropertyOption[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดโครงการไม่สำเร็จ");
      }

      setProperties(payload.properties ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดโครงการไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { properties, status, error, reload: load };
}
