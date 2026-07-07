"use client";

import { useCallback, useState } from "react";

type LinkStatus = "idle" | "linking" | "error";

export function useTenantLink() {
  const [status, setStatus] = useState<LinkStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const link = useCallback(async (inviteCode: string, lineUserId: string) => {
    setStatus("linking");
    setError(null);

    try {
      const response = await fetch("/api/tenants/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: inviteCode,
          line_user_id: lineUserId,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        tenant_id?: string;
        tenant_name?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "ผูกห้องไม่สำเร็จ");
      }

      setStatus("idle");
      return payload;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "ผูกห้องไม่สำเร็จ");
      return null;
    }
  }, []);

  return { status, error, link };
}
