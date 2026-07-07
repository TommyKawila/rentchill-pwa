"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

export function LandingSkin() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <LocaleToggleSkin />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          RentChill
        </p>
        <h1 className="mt-3 text-3xl font-bold">{t("landing.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          {t("landing.desc")}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="/admin/login"
            className="rounded-md bg-zinc-900 py-3 text-sm font-medium text-white"
          >
            {t("landing.ownerLogin")}
          </a>
          <a
            href="/demo-apartment"
            className="rounded-md border border-zinc-300 bg-white py-3 text-sm font-medium"
          >
            {t("landing.demoProperty")}
          </a>
        </div>

        <p className="mt-10 text-xs text-zinc-500">{t("landing.footer")}</p>
      </div>
    </main>
  );
}
