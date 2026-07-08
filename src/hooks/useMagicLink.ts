"use client";

import { useCallback, useEffect, useState } from "react";

type ShareLink = {
  url: string;
  expires_at: string | null;
  is_permanent: boolean;
  is_expired?: boolean;
};

type MagicLinkStatus = "idle" | "loading" | "creating" | "error";

export function useMagicLink(propertySlug: string) {
  const [link, setLink] = useState<ShareLink | null>(null);
  const [status, setStatus] = useState<MagicLinkStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/share`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        link?: ShareLink | null;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "โหลดลิงก์ไม่สำเร็จ");
      }

      setLink(payload.link ?? null);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "โหลดลิงก์ไม่สำเร็จ");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const createLink = useCallback(async () => {
    setStatus("creating");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/share`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        link?: ShareLink;
      };

      if (!response.ok || !payload.ok || !payload.link) {
        throw new Error(payload.error ?? "สร้างลิงก์ไม่สำเร็จ");
      }

      setLink(payload.link);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "สร้างลิงก์ไม่สำเร็จ");
    }
  }, [propertySlug]);

  const copyLink = useCallback(async () => {
    if (!link?.url) return false;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, [link?.url]);

  return { link, status, error, copied, reload: load, createLink, copyLink };
}
