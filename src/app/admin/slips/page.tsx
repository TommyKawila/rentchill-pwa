"use client";

import { Suspense } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { PlatformSlipsSkin } from "@/components/skins/minimal/PlatformSlipsSkin";
import { usePlatformSlips } from "@/hooks/usePlatformSlips";

function SlipsContent() {
  const { t } = useLocale();
  const slips = usePlatformSlips();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("admin.slips.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("admin.slips.title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("admin.slips.desc")}</p>
        </header>

        <section className="mt-8">
          {slips.status === "loading" && slips.payments.length === 0 && (
            <p className="text-sm text-zinc-500">{t("common.loading")}</p>
          )}

          <PlatformSlipsSkin
            payments={slips.payments}
            disabled={slips.status === "approving"}
            error={slips.error}
            onApprove={(id) => void slips.approve(id)}
          />

          <a
            href="/dashboard"
            className="mt-6 block text-center text-sm text-zinc-600 underline"
          >
            {t("common.backToDashboard")}
          </a>
        </section>
      </div>
    </main>
  );
}

function SlipsFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function AdminSlipsPage() {
  return (
    <Suspense fallback={<SlipsFallback />}>
      <SlipsContent />
    </Suspense>
  );
}
