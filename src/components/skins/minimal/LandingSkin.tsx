"use client";

import { useLocale } from "@/components/LocaleProvider";
import { DashboardPreviewSkin } from "@/components/skins/minimal/DashboardPreviewSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

const FEATURE_KEYS = [
  "landing.features.billing",
  "landing.features.slip",
  "landing.features.line",
  "landing.features.export",
] as const;

const PRICING = [
  { tier: "starter", rooms: 3, price: "0" },
  { tier: "micro", rooms: 20, price: "290" },
  { tier: "growth", rooms: 50, price: "590" },
  { tier: "pro", rooms: 100, price: "990" },
] as const;

export function LandingSkin() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <p className="text-sm font-bold tracking-tight text-zinc-900">RentChill</p>
          <div className="flex items-center gap-3">
            <LocaleToggleSkin />
            <a
              href="/admin/login"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              {t("landing.ownerLogin")}
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            RentChill
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
            {t("landing.hero.desc")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/admin/signup"
              className="rounded-lg bg-green-600 px-6 py-3 text-center text-sm font-medium text-white"
            >
              {t("landing.hero.ctaPrimary")}
            </a>
            <a
              href="/admin/login"
              className="rounded-lg border border-zinc-200 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-900"
            >
              {t("landing.hero.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-bold tracking-tight">
            {t("landing.features.title")}
          </h2>
          <div className="mt-6 divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
            {FEATURE_KEYS.map((key) => (
              <div key={key} className="px-6 py-4">
                <p className="text-sm font-medium text-zinc-900">{t(`${key}.title`)}</p>
                <p className="mt-1 text-sm text-zinc-500">{t(`${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-bold tracking-tight">
            {t("landing.preview.sectionTitle")}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">{t("landing.preview.sectionDesc")}</p>
          <div className="mt-6">
            <DashboardPreviewSkin />
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-bold tracking-tight">{t("landing.pricing.title")}</h2>
          <p className="mt-2 text-sm text-zinc-500">{t("landing.pricing.desc")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PRICING.map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-xl border p-6 ${
                  plan.tier === "starter"
                    ? "border-green-200 bg-green-50/40"
                    : "border-zinc-100 bg-white"
                }`}
              >
                <p className="text-sm font-semibold text-zinc-900">
                  {t(`owner.plan.tier.${plan.tier}`)}
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {plan.price === "0"
                    ? t("landing.pricing.free")
                    : t("landing.pricing.perMonth", { price: plan.price })}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {t("landing.pricing.rooms", { count: plan.rooms })}
                </p>
              </div>
            ))}
          </div>
          <a
            href="/admin/signup"
            className="mt-8 block rounded-lg bg-zinc-900 py-3 text-center text-sm font-medium text-white"
          >
            {t("landing.hero.ctaPrimary")}
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-100 px-4 py-8">
        <p className="mx-auto max-w-3xl text-center text-xs text-zinc-500">
          {t("landing.footer")}
        </p>
      </footer>
    </main>
  );
}
