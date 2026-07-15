"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import { BrandLogoSkin } from "@/components/skins/minimal/BrandLogoSkin";
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

const TIER_FEATURES: Record<(typeof PRICING)[number]["tier"], readonly MessageKey[]> = {
  starter: [
    "landing.pricing.feat.billing",
    "landing.pricing.feat.manualSlip",
    "landing.pricing.feat.lineBasic",
  ],
  micro: [
    "landing.pricing.feat.autoSlip",
    "landing.pricing.feat.meterUpload",
    "landing.pricing.feat.shareWeek",
  ],
  growth: [
    "landing.pricing.feat.meterHistory",
    "landing.pricing.feat.docs",
    "landing.pricing.feat.contractPdf",
  ],
  pro: [
    "landing.pricing.feat.meterTenant",
    "landing.pricing.feat.esign",
    "landing.pricing.feat.unlimited",
  ],
};

export function LandingSkin() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <BrandLogoSkin size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleToggleSkin />
            <a
              href="/admin/login"
              className="hidden min-h-12 items-center px-2 text-base text-zinc-500 hover:text-zinc-900 sm:flex"
            >
              {t("landing.ownerLogin")}
            </a>
            <a
              href="/admin/signup"
              className="flex min-h-12 items-center rounded-lg bg-rc-green px-4 py-2.5 text-base font-medium text-white hover:bg-rc-green-dark"
            >
              {t("landing.hero.ctaPrimary")}
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-100 bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-wide text-rc-green">
            {t("landing.hero.badge")}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 md:text-base">
            {t("landing.hero.desc")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="/admin/signup"
              className="flex min-h-14 items-center justify-center rounded-lg bg-rc-green px-6 py-3 text-center text-base font-medium text-white hover:bg-rc-green-dark"
            >
              {t("landing.hero.ctaPrimary")}
            </a>
            <a
              href="/try"
              className="flex min-h-12 items-center justify-center rounded-lg border border-rc-green/30 bg-rc-green-soft px-6 py-3 text-center text-base font-medium text-zinc-900"
            >
              {t("landing.hero.ctaTrial")}
            </a>
            <a
              href="/admin/login"
              className="flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-3 text-center text-base font-medium text-zinc-900"
            >
              {t("landing.hero.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-100 px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-100 bg-white p-6">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              {t("landing.pain.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {t("landing.pain.desc")}
            </p>
          </div>
          <div className="rounded-xl border border-rc-green/20 bg-rc-green-soft p-6">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              {t("landing.solution.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {t("landing.solution.desc")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold tracking-tight">
            {t("landing.features.title")}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURE_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-xl border border-zinc-100 bg-white p-6"
              >
                <p className="text-sm font-semibold text-zinc-900">
                  {t(`${key}.title`)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {t(`${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-100 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold tracking-tight">
            {t("landing.preview.sectionTitle")}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {t("landing.preview.sectionDesc")}
          </p>
          <div className="mt-6">
            <DashboardPreviewSkin />
            <div className="mt-4 text-center">
              <a
                href="/try"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-3 text-base font-medium text-zinc-900"
              >
                {t("landing.preview.tryLive")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-zinc-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold tracking-tight">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">{t("landing.pricing.desc")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING.map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-xl border p-6 ${
                  plan.tier === "starter"
                    ? "border-rc-green/30 bg-rc-green-soft"
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
                <ul className="mt-3 space-y-1.5">
                  {TIER_FEATURES[plan.tier].map((key) => (
                    <li key={key} className="text-sm text-zinc-600">
                      · {t(key)}
                    </li>
                  ))}
                </ul>
                {plan.tier === "starter" && (
                  <p className="mt-3 text-sm text-zinc-500">
                    {t("landing.pricing.starterNote")}
                  </p>
                )}
                <a
                  href={`/try?plan=${plan.tier}`}
                  className="mt-4 flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-800"
                >
                  {t("landing.pricing.tryPlan")}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            {t("landing.pricing.paidSlipNote")}
          </p>
        </div>
      </section>

      <section className="bg-rc-charcoal px-4 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {t("landing.cta.finalTitle")}
          </h2>
          <p className="mt-3 text-sm text-zinc-300">{t("landing.cta.finalDesc")}</p>
          <a
            href="/admin/signup"
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-lg bg-rc-green px-8 py-3 text-base font-medium text-white hover:bg-rc-green-dark"
          >
            {t("landing.cta.final")}
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3">
          <BrandLogoSkin size="sm" />
          <p className="text-center text-sm text-zinc-500">{t("landing.footer")}</p>
        </div>
      </footer>
    </main>
  );
}
