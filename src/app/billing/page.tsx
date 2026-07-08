"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { PlanBillingSkin } from "@/components/skins/minimal/PlanBillingSkin";
import { usePlatformBilling } from "@/hooks/usePlatformBilling";

function BillingContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";
  const billing = usePlatformBilling();

  const isBusy = billing.status === "loading" || billing.status === "uploading";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("owner.planBilling.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("owner.planBilling.title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("owner.planBilling.desc")}</p>
        </header>

        <section className="mt-8">
          {billing.status === "loading" && !billing.subscription && (
            <p className="text-sm text-zinc-500">{t("common.loading")}</p>
          )}

          {billing.subscription && billing.account && (
            <PlanBillingSkin
              subscription={billing.subscription}
              account={billing.account}
              disabled={isBusy}
              error={billing.error}
              submitted={billing.submitted}
              onSubmitSlip={(tier, file) => void billing.submitSlip(tier, file)}
            />
          )}

          <a
            href={`/dashboard?property=${encodeURIComponent(propertySlug)}`}
            className="mt-6 block text-center text-sm text-zinc-600 underline"
          >
            {t("common.backToDashboard")}
          </a>
        </section>
      </div>
    </main>
  );
}

function BillingFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingFallback />}>
      <BillingContent />
    </Suspense>
  );
}
