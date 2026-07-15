"use client";

import { useLocale } from "@/components/LocaleProvider";

export function OfflineSkin() {
  const { t } = useLocale();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8 text-center">
      <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
        {t("offline.title")}
      </h1>
      <p className="max-w-sm text-base text-zinc-600">{t("offline.desc")}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex min-h-14 items-center justify-center rounded-lg bg-rc-green px-6 text-base font-medium text-white hover:bg-rc-green-dark"
      >
        {t("offline.retry")}
      </button>
    </main>
  );
}
