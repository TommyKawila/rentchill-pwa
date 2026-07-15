"use client";

import { useCallback, useState } from "react";

type DispatchStatus = "idle" | "copied" | "fallback";

export function useTechnicianLineDispatch() {
  const [status, setStatus] = useState<DispatchStatus>("idle");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const dispatch = useCallback(async (lineUrl: string, message: string) => {
    setFallbackMessage(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        setStatus("copied");
      } else {
        setFallbackMessage(message);
        setStatus("fallback");
      }
    } catch (err) {
      console.error("[useTechnicianLineDispatch]", { lineUrl }, err);
      setFallbackMessage(message);
      setStatus("fallback");
    }

    window.open(lineUrl, "_blank", "noopener,noreferrer");
  }, []);

  const clearStatus = useCallback(() => {
    setStatus("idle");
    setFallbackMessage(null);
  }, []);

  return { dispatch, status, fallbackMessage, clearStatus };
}
