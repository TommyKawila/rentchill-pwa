"use client";

import { useLocale } from "@/components/LocaleProvider";

export function LandingSolutionBandSkin() {
  const { t } = useLocale();

  return (
    <section className="border-b border-zinc-100 bg-rc-green-soft px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
          {t("landing.solution.sectionTitle")}
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-rc-green/20 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-rc-green">
              01
            </p>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              {t("landing.solution.pwa.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {t("landing.solution.pwa.desc")}
            </p>
          </article>
          <article className="rounded-xl border border-rc-green/20 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-rc-green">
              02
            </p>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              {t("landing.solution.line.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {t("landing.solution.line.desc")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
