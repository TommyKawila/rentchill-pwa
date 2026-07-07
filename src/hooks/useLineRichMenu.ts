"use client";

import { useCallback, useEffect, useState } from "react";

type RichMenuStatus = {
  configured: boolean;
  liffUrl: string;
  endpointUrl: string;
  richmenus?: Array<{ richMenuId: string; name: string; chatBarText: string }>;
  message?: string;
};

export function useLineRichMenu() {
  const [status, setStatus] = useState<RichMenuStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/line/rich-menu");
      const payload = (await response.json()) as RichMenuStatus & {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดสถานะ Rich Menu ไม่สำเร็จ");
      }

      setStatus(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดสถานะ Rich Menu ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const deploy = useCallback(async () => {
    setDeploying(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/line/rich-menu", { method: "POST" });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        richMenuId?: string;
        liffUrl?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Deploy Rich Menu ไม่สำเร็จ");
      }

      setSuccess(`Deploy สำเร็จ — richMenuId: ${payload.richMenuId ?? "-"}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy Rich Menu ไม่สำเร็จ");
    } finally {
      setDeploying(false);
    }
  }, [load]);

  return { status, loading, deploying, error, success, reload: load, deploy };
}
