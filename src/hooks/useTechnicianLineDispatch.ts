"use client";

import { useCallback, useState } from "react";
import { shareMaintenanceDispatch } from "@/services/maintenanceDispatchClientService";

type DispatchStatus = "idle" | "shared" | "copied" | "fallback";

export function useTechnicianLineDispatch() {
  const [status, setStatus] = useState<DispatchStatus>("idle");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const dispatch = useCallback(async (lineUrl: string | null, message: string) => {
    setFallbackMessage(null);
    try {
      const outcome = await shareMaintenanceDispatch({ message, lineUrl });
      setStatus(outcome);
      if (outcome === "fallback") {
        setFallbackMessage(message);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("[useTechnicianLineDispatch]", { lineUrl }, err);
      setFallbackMessage(message);
      setStatus("fallback");
    }
  }, []);

  const clearStatus = useCallback(() => {
    setStatus("idle");
    setFallbackMessage(null);
  }, []);

  return { dispatch, status, fallbackMessage, clearStatus };
}
