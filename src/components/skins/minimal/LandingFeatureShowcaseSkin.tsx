"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import { DashboardPreviewSkin } from "@/components/skins/minimal/DashboardPreviewSkin";
import type { ReminderTier } from "@/services/paymentReminderTier";

const REMINDER_STEPS: ReadonlyArray<{
  tier: ReminderTier;
  labelKey: MessageKey;
  headerKey: MessageKey;
  bodyKey: MessageKey;
  ctaKey: MessageKey;
  urgent: boolean;
}> = [
  {
    tier: "soft",
    labelKey: "landing.showcase.reminder.tierSoft",
    headerKey: "landing.showcase.reminder.headerSoft",
    bodyKey: "landing.showcase.reminder.bodySoft",
    ctaKey: "landing.showcase.reminder.ctaSoft",
    urgent: false,
  },
  {
    tier: "firm",
    labelKey: "landing.showcase.reminder.tierFirm",
    headerKey: "landing.showcase.reminder.headerFirm",
    bodyKey: "landing.showcase.reminder.bodyFirm",
    ctaKey: "landing.showcase.reminder.ctaFirm",
    urgent: false,
  },
  {
    tier: "final",
    labelKey: "landing.showcase.reminder.tierFinal",
    headerKey: "landing.showcase.reminder.headerFinal",
    bodyKey: "landing.showcase.reminder.bodyFinal",
    ctaKey: "landing.showcase.reminder.ctaFinal",
    urgent: true,
  },
];

function ReminderFlexMock() {
  const { t } = useLocale();
  const [tier, setTier] = useState<ReminderTier>("soft");
  const active = REMINDER_STEPS.find((step) => step.tier === tier) ?? REMINDER_STEPS[0];

  return (
    <div>
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {t("landing.showcase.reminder.tapHint")}
      </p>
      <div className="mb-2 flex rounded-lg border border-zinc-100 bg-zinc-50 p-1">
        {REMINDER_STEPS.map((step) => {
          const selected = tier === step.tier;
          return (
            <button
              key={step.tier}
              type="button"
              onClick={() => setTier(step.tier)}
              className={`flex-1 rounded-md px-1 py-2 text-[10px] font-semibold leading-tight transition ${
                selected
                  ? step.urgent
                    ? "bg-rc-danger text-white shadow-sm"
                    : "bg-rc-green text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t(step.labelKey)}
            </button>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
        <div className={`px-4 py-3 ${active.urgent ? "bg-rc-danger" : "bg-rc-green"}`}>
          <p className="text-sm font-bold text-white">{t(active.headerKey)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs leading-relaxed text-zinc-600">{t(active.bodyKey)}</p>
          <div className="mt-3 flex items-baseline justify-between border-t border-zinc-100 pt-3">
            <span className="text-sm text-zinc-500">{t("landing.showcase.reminder.amountLabel")}</span>
            <span
              className={`text-xl font-bold tabular-nums ${
                active.urgent ? "text-rc-danger" : "text-rc-green"
              }`}
            >
              ฿8,500
            </span>
          </div>
        </div>
        <div className="border-t border-zinc-100 p-3">
          <div
            className={`rounded-lg py-2.5 text-center text-xs font-medium text-white ${
              active.urgent ? "bg-rc-danger" : "bg-rc-green"
            }`}
          >
            {t(active.ctaKey)}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsExportMock() {
  const { t } = useLocale();

  const bars = [72, 48, 85, 60, 90, 55];

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3">
      <div className="flex items-end justify-between gap-1" style={{ height: 56 }}>
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div
              className={`w-full rounded-t ${i % 2 === 0 ? "bg-rc-success/70" : "bg-rc-danger/60"}`}
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-xs text-zinc-500">{t("landing.showcase.analytics.revenue")}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-rc-success">฿42k</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{t("landing.showcase.analytics.expense")}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-rc-danger">฿8k</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{t("landing.showcase.analytics.net")}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-rc-success">฿34k</p>
        </div>
      </div>
      <div className="mt-2 flex justify-center">
        <span className="rounded-lg border border-rc-green/30 bg-rc-green-soft px-3 py-1 text-xs font-medium text-rc-green-ink">
          {t("owner.analytics.export.excel")}
        </span>
      </div>
    </div>
  );
}

export function LandingFeatureShowcaseSkin() {
  const { t } = useLocale();

  const slots: ReadonlyArray<{
    title: MessageKey;
    desc: MessageKey;
    content: React.ReactNode;
  }> = [
    {
      title: "landing.showcase.dashboard.title",
      desc: "landing.showcase.dashboard.desc",
      content: <DashboardPreviewSkin />,
    },
    {
      title: "landing.showcase.reminder.title",
      desc: "landing.showcase.reminder.desc",
      content: <ReminderFlexMock />,
    },
    {
      title: "landing.showcase.analytics.title",
      desc: "landing.showcase.analytics.desc",
      content: <AnalyticsExportMock />,
    },
  ];

  return (
    <section className="border-b border-zinc-100 bg-white px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
          {t("landing.showcase.title")}
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {slots.map((slot) => (
            <article key={slot.title}>
              <h3 className="text-sm font-semibold text-zinc-900">{t(slot.title)}</h3>
              <p className="mt-1 text-sm text-zinc-500">{t(slot.desc)}</p>
              <div className="mt-4">{slot.content}</div>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/try"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-3 text-base font-medium text-zinc-900"
          >
            {t("landing.preview.tryLive")}
          </a>
        </div>
      </div>
    </section>
  );
}
