"use client";

import { Bell, BellOff } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface PushNotificationStatusSkinProps {
  permission: NotificationPermission | "unsupported";
  pushConfigured?: boolean;
  requesting?: boolean;
  onEnable?: () => void;
}

export function PushNotificationStatusSkin({
  permission,
  pushConfigured = true,
  requesting,
  onEnable,
}: PushNotificationStatusSkinProps) {
  const { t } = useLocale();

  if (permission === "unsupported") return null;

  if (!pushConfigured) {
    return (
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
        <h2 className="text-base font-semibold text-zinc-900">{t("push.status.title")}</h2>
        <p className="mt-3 text-sm text-zinc-500">{t("push.status.unconfigured")}</p>
      </div>
    );
  }

  const enabled = permission === "granted";

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
      <h2 className="text-base font-semibold text-zinc-900">{t("push.status.title")}</h2>

      {enabled ? (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="inline-flex items-center gap-x-2 text-base font-medium text-green-700">
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            {t("push.status.enabled.title")}
          </p>
          <p className="mt-1 text-sm text-green-800">{t("push.status.enabled.desc")}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="inline-flex items-center gap-x-2 text-base font-medium text-red-700">
              <BellOff className="h-5 w-5" strokeWidth={1.5} />
              {t("push.status.disabled.title")}
            </p>
            <p className="mt-1 text-sm text-red-800">{t("push.status.disabled.desc")}</p>
          </div>
          {onEnable && permission !== "denied" && (
            <button
              type="button"
              disabled={requesting}
              onClick={onEnable}
              className="inline-flex min-h-14 w-full items-center justify-center gap-x-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              {requesting ? t("common.loading") : t("push.status.enableButton")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
