"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlatformStats } from "@/services/platformStatsService";

type StatsStatus = "idle" | "loading" | "error";

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [status, setStatus] = useState<StatsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/admin/stats");
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        stats?: PlatformStats;
      };

      if (!response.ok || !payload.ok || !payload.stats) {
        throw new Error(payload.error ?? "โหลดสถิติไม่สำเร็จ");
      }

      setStats(payload.stats);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดสถิติไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, status, error, reload: load };
}
