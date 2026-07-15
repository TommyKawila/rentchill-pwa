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
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
      <h2 className="text-base font-semibold text-zinc-900">{t("settings.notifyTitle")}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t("settings.notifyDesc")}</p>

      {linked ? (
        <div className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4">
          <p className="text-base text-green-800">{t("settings.notifyConnected")}</p>
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex min-h-12 shrink-0 items-center text-base text-zinc-600 underline"
          >
            {t("settings.notifyDisconnect")}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <button
            type="button"
            disabled={status === "loading" || !propertySlug}
            onClick={() => void handleConnect()}
            className="flex min-h-14 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading"
              ? t("settings.notifyConnecting")
              : t("settings.notifyConnect")}
          </button>
          <p className="text-sm text-zinc-500">{t("settings.notifyConnectHint")}</p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
