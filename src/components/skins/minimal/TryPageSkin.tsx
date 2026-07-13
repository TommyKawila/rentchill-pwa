"use client";

import { useLocale } from "@/components/LocaleProvider";
import { BrandLogoSkin } from "@/components/skins/minimal/BrandLogoSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface TryPageSkinProps {
  plan?: string;
  loading: boolean;
  error: string | null;
  onStart: () => void;
}

export function TryPageSkin({ plan, loading, error, onStart }: TryPageSkinProps) {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-md space-y-8">
        <header className="flex items-center justify-between">
          <BrandLogoSkin size="sm" />
          <LocaleToggleSkin />
        </header>

        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rc-green">
            {t("trial.page.badge")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{t("trial.page.title")}</h1>
          <p className="text-sm leading-relaxed text-zinc-600">{t("trial.page.desc")}</p>
          {plan && (
            <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              {t("trial.page.planHint", { plan })}
            </p>
          )}
        </section>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={onStart}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-rc-green px-6 py-3 text-sm font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("trial.page.starting") : t("trial.page.start")}
        </button>

        <p className="text-center text-xs text-zinc-500">{t("trial.page.note")}</p>

        <a
          href="/"
          className="block text-center text-sm text-zinc-500 underline-offset-2 hover:underline"
        >
          {t("trial.page.back")}
        </a>
      </div>
    </main>
  );
}
