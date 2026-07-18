"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import { BrandLogoSkin } from "@/components/skins/minimal/BrandLogoSkin";
import { LandingFeatureShowcaseSkin } from "@/components/skins/minimal/LandingFeatureShowcaseSkin";
import { LandingPricingMatrixSkin } from "@/components/skins/minimal/LandingPricingMatrixSkin";
import { LandingRoomCalculatorSkin } from "@/components/skins/minimal/LandingRoomCalculatorSkin";
import { LandingPainPointsSkin } from "@/components/skins/minimal/LandingPainPointsSkin";
import { LandingSolutionBandSkin } from "@/components/skins/minimal/LandingSolutionBandSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { PREMIUM_PRICE_THB, TIER_ROOM_LIMITS } from "@/services/planLimits";

const PREMIUM_FEATURES: readonly MessageKey[] = [
  "landing.pricing.feat.lineAuto",
  "landing.pricing.feat.autoRemind",
  "landing.pricing.feat.analyticsExport",
  "landing.pricing.feat.maintenance",
  "landing.pricing.feat.esign",
];

function HeroPhoneMock() {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2rem] border border-zinc-200 bg-zinc-900 p-2 ring-1 ring-zinc-900/5">
      <div className="overflow-hidden rounded-[1.4rem] bg-white">
        <div className="bg-rc-green px-4 py-3">
          <p className="text-xs font-semibold text-white">RentChill</p>
        </div>
        <div className="space-y-2 p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: t("owner.overview.paid"), value: "8", accent: true },
              { label: t("owner.overview.unpaid"), value: "2" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg border px-2 py-2 ${
                  stat.accent
                    ? "border-rc-success/30 bg-rc-success-soft"
                    : "border-zinc-100 bg-zinc-50"
                }`}
              >
                <p className="text-[10px] text-zinc-500">{stat.label}</p>
                <p className="text-lg font-bold text-zinc-900">{stat.value}</p>
              </div>
            ))}
          </div>
          {["101", "102"].map((room) => (
            <div
              key={room}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-xs"
            >
              <span className="font-semibold">{t("common.room", { number: room })}</span>
              <span className="text-rc-success">{t("landing.preview.paid")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingSkin() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-rc-bg text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 px-4 py-3 backdrop-blur-md">
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

      <section className="border-b border-zinc-100 bg-[radial-gradient(ellipse_at_top,_var(--color-rc-green-soft)_0%,_white_55%)] px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div className="rc-animate-fade-up">
            <p className="text-sm font-medium uppercase tracking-wide text-rc-green">
              {t("landing.hero.badge")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 md:text-lg">
              {t("landing.hero.desc")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="/admin/signup"
                className="flex min-h-[52px] items-center justify-center rounded-lg bg-rc-green px-6 py-3 text-center text-base font-medium text-white hover:bg-rc-green-dark"
              >
                {t("landing.hero.ctaPrimary")}
              </a>
              <a
                href="/try"
                className="flex min-h-12 items-center justify-center rounded-lg border border-rc-green/30 bg-white/80 px-6 py-3 text-center text-base font-medium text-zinc-900"
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
          <div className="rc-animate-fade-up-delay">
            <HeroPhoneMock />
          </div>
        </div>
      </section>

      <LandingPainPointsSkin />
      <LandingSolutionBandSkin />
      <LandingFeatureShowcaseSkin />

      <section id="pricing" className="border-b border-zinc-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">{t("landing.pricing.desc")}</p>
          <p className="mt-1 text-sm font-medium text-rc-green-ink">
            {t("landing.pricing.premiumHint")}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-rc-green/30 bg-rc-green-soft p-6">
              <p className="text-sm font-semibold text-zinc-900">{t("owner.plan.tier.free")}</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{t("landing.pricing.free")}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {t("landing.pricing.rooms", { count: TIER_ROOM_LIMITS.free })}
              </p>
              <p className="mt-3 text-sm text-zinc-600">{t("landing.pricing.freeNote")}</p>
              <a
                href="/admin/signup"
                className="mt-4 flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-800"
              >
                {t("landing.pricing.tryPlan")}
              </a>
            </div>
            <div className="rounded-xl border border-rc-green-dark bg-rc-green p-6 text-white">
              <p className="text-sm font-semibold">{t("owner.plan.tier.premium")}</p>
              <p className="mt-2 text-2xl font-bold">
                {t("landing.pricing.perMonth", { price: String(PREMIUM_PRICE_THB) })}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {t("landing.pricing.rooms", { count: TIER_ROOM_LIMITS.premium })}
              </p>
              <ul className="mt-3 space-y-1.5">
                {PREMIUM_FEATURES.map((key) => (
                  <li key={key} className="text-sm text-white/90">
                    · {t(key)}
                  </li>
                ))}
              </ul>
              <a
                href="/admin/signup?plan=premium"
                className="mt-4 flex min-h-12 items-center justify-center rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-rc-green-ink hover:bg-rc-green-soft"
              >
                {t("landing.pricing.tryPlan")}
              </a>
            </div>
          </div>

          <div className="md:hidden">
            <LandingRoomCalculatorSkin />
          </div>

          <p className="mt-4 text-sm text-zinc-500">{t("landing.pricing.paidSlipNote")}</p>
          <div className="hidden md:block">
            <LandingPricingMatrixSkin />
          </div>
        </div>
      </section>

      <section className="border-t-2 border-rc-green bg-rc-charcoal px-4 py-16">
        <div className="rc-animate-fade-up mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t("landing.cta.finalTitle")}
          </h2>
          <p className="mt-3 text-sm text-zinc-300">{t("landing.cta.finalDesc")}</p>
          <a
            href="/admin/signup"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-lg bg-rc-green px-8 py-3 text-base font-medium text-white hover:bg-rc-green-dark"
          >
            {t("landing.cta.final")}
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3">
          <BrandLogoSkin size="sm" />
          <p className="text-center text-sm text-zinc-500">{t("landing.footer")}</p>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <a href="/privacy" className="text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
              {t("landing.legal.privacy")}
            </a>
            <a href="/terms" className="text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
              {t("landing.legal.terms")}
            </a>
            <a href="/contact" className="text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
              {t("landing.legal.contact")}
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
