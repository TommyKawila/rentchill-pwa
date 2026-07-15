"use client";

import { useLocale } from "@/components/LocaleProvider";

export function ShareNotFoundSkin() {
  const { t } = useLocale();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-sm rounded-xl border border-zinc-100 bg-white p-6 text-center">
        <h1 className="text-base font-semibold text-zinc-900">{t("share.notFoundTitle")}</h1>
        <p className="mt-2 text-base text-zinc-600">{t("share.notFoundDesc")}</p>
        <a
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center text-base font-medium text-zinc-900 underline"
        >
          {t("share.notFoundHome")}
        </a>
      </div>
    </main>
  );
}
