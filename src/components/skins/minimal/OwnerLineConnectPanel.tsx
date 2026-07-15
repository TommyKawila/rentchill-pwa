"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { MobileFrame } from "@/components/frames/MobileFrame";
import { useLineAuth } from "@/hooks/useLineAuth";

interface OwnerLineConnectPanelProps {
  propertySlug: string;
  token: string;
}

type ConnectStatus = "idle" | "linking" | "success" | "error";

export function OwnerLineConnectPanel({
  propertySlug,
  token,
}: OwnerLineConnectPanelProps) {
  const { t } = useLocale();
  const startedRef = useRef(false);
  const [status, setStatus] = useState<ConnectStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    isLoading: authLoading,
    error: authError,
    lineUserId,
    statusMessage,
  } = useLineAuth();

  useEffect(() => {
    if (authLoading || !lineUserId || startedRef.current) return;
    startedRef.current = true;

    setStatus("linking");

    void fetch("/api/properties/line-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, line_user_id: lineUserId }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "เชื่อมต่อไม่สำเร็จ");
        }
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "เชื่อมต่อไม่สำเร็จ");
      });
  }, [authLoading, lineUserId, token]);

  if (authLoading) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-6 text-sm text-zinc-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <p>{statusMessage || t("settings.notifyConnecting")}</p>
        </div>
      </MobileFrame>
    );
  }

  if (authError && !lineUserId) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] items-center justify-center p-6 text-center text-sm text-red-700">
          {authError}
        </div>
      </MobileFrame>
    );
  }

  if (!lineUserId) {
    return (
      <MobileFrame>
        <div className="flex min-h-[420px] items-center justify-center p-6 text-center text-sm text-zinc-600">
          {t("tenant.board.openInLine")}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-6 text-center">
        {status === "linking" && (
          <>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            <p className="text-sm text-zinc-600">{t("settings.notifyConnecting")}</p>
          </>
        )}
        {status === "success" && (
          <>
            <p className="text-lg font-semibold text-green-700">
              {t("settings.notifySuccess")}
            </p>
            <p className="text-sm text-zinc-600">{t("settings.notifySuccessHint")}</p>
            <a
              href={`/settings?property=${encodeURIComponent(propertySlug)}`}
              className="mt-2 flex min-h-14 items-center rounded-lg bg-rc-green px-6 text-base font-medium text-white hover:bg-rc-green-dark"
            >
              {t("settings.notifyBackToSettings")}
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-sm text-red-700">{error}</p>
            <a
              href={`/settings?property=${encodeURIComponent(propertySlug)}`}
              className="mt-2 inline-flex min-h-12 items-center text-base text-zinc-600 underline"
            >
              {t("settings.notifyBackToSettings")}
            </a>
          </>
        )}
      </div>
    </MobileFrame>
  );
}
