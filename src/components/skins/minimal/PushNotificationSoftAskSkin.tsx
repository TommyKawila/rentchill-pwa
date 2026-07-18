"use client";

import { Bell } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface PushNotificationSoftAskSkinProps {
  requesting: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export function PushNotificationSoftAskSkin({
  requesting,
  onEnable,
  onDismiss,
}: PushNotificationSoftAskSkinProps) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("push.softAsk.secondary")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onDismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm rounded-t-xl border border-zinc-200 bg-white p-6 sm:rounded-xl"
      >
        <h2 className="text-base font-semibold text-zinc-900">
          {t("push.softAsk.title")}
        </h2>
        <p className="mt-2 text-base text-zinc-600">{t("push.softAsk.body")}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-zinc-600">
          <li>{t("push.softAsk.bulletRepair")}</li>
          <li>{t("push.softAsk.bulletSlip")}</li>
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={requesting}
            onClick={onEnable}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-x-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            {requesting ? t("common.loading") : t("push.softAsk.primary")}
          </button>
          <button
            type="button"
            disabled={requesting}
            onClick={onDismiss}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("push.softAsk.secondary")}
          </button>
        </div>
      </div>
    </div>
  );
}
