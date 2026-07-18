"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";

const PAINS = [
  { title: "landing.pain.chaser.title", desc: "landing.pain.chaser.desc", step: "01" },
  { title: "landing.pain.scattered.title", desc: "landing.pain.scattered.desc", step: "02" },
  { title: "landing.pain.tax.title", desc: "landing.pain.tax.desc", step: "03" },
] as const satisfies ReadonlyArray<{
  title: MessageKey;
  desc: MessageKey;
  step: string;
}>;

export function LandingPainPointsSkin() {
  const { t } = useLocale();

  return (
    <section className="border-b border-zinc-100 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
          {t("landing.pain.sectionTitle")}
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {PAINS.map(({ title, desc, step }) => (
            <article
              key={title}
              className="rounded-xl border border-zinc-100 bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-rc-green">
                {step}
              </p>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                {t(title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {t(desc)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
