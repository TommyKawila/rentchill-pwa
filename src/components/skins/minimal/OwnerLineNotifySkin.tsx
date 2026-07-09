"use client";

import { useCallback, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type ConnectStatus = "idle" | "loading" | "error";

interface OwnerLineNotifySkinProps {
  propertySlug: string;
  ownerLineUserId: string | null;
  onDisconnect: () => void;
}

export function OwnerLineNotifySkin({
  propertySlug,
  ownerLineUserId,
  onDisconnect,
}: OwnerLineNotifySkinProps) {
  const { t } = useLocale();
  const [status, setStatus] = useState<ConnectStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    if (!propertySlug) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/line-connect-token`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        liff_url?: string;
      };

      if (!response.ok || !payload.ok || !payload.liff_url) {
        throw new Error(payload.error ?? "สร้างลิงก์ไม่สำเร็จ");
      }

      window.open(payload.liff_url, "_blank", "noopener,noreferrer");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "สร้างลิงก์ไม่สำเร็จ");
    }
  }, [propertySlug]);

  const linked = Boolean(ownerLineUserId?.trim());

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <h2 className="text-sm font-semibold">{t("settings.notifyTitle")}</h2>
      <p className="mt-1 text-xs text-zinc-500">{t("settings.notifyDesc")}</p>

      {linked ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
          <p className="text-sm text-green-800">{t("settings.notifyConnected")}</p>
          <button
            type="button"
            onClick={onDisconnect}
            className="shrink-0 text-xs text-zinc-600 underline"
          >
            {t("settings.notifyDisconnect")}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <button
            type="button"
            disabled={status === "loading" || !propertySlug}
            onClick={() => void handleConnect()}
            className="w-full rounded-lg border border-zinc-300 bg-white py-3 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading"
              ? t("settings.notifyConnecting")
              : t("settings.notifyConnect")}
          </button>
          <p className="text-xs text-zinc-500">{t("settings.notifyConnectHint")}</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
