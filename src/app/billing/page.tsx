"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { PlanBillingSkin } from "@/components/skins/minimal/PlanBillingSkin";
import { OwnerBottomNavSkin } from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { SubscriptionBannerSkin } from "@/components/skins/minimal/SubscriptionBannerSkin";
import { usePlatformBilling } from "@/hooks/usePlatformBilling";

function BillingContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";
  const billing = usePlatformBilling();

  const isBusy = billing.status === "loading" || billing.status === "uploading";

  return (
    <main className="min-h-screen bg-rc-bg px-4 py-4 pb-24 text-rc-text">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-4 border-b border-zinc-100 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium tracking-tight text-rc-green">
              {t("owner.planBilling.tag")}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <LocaleToggleSkin />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("owner.planBilling.title")}
            </h1>
            <p className="mt-2 text-base text-zinc-500">{t("owner.planBilling.desc")}</p>
          </div>
        </header>

        <section className="space-y-4">
          {billing.status === "loading" && !billing.subscription && (
            <p className="text-base text-zinc-500">{t("common.loading")}</p>
          )}

          {billing.subscription && (
            <SubscriptionBannerSkin
              subscription={billing.subscription}
              propertySlug={propertySlug}
            />
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
            className="flex min-h-12 items-center justify-center text-center text-base font-medium text-zinc-600 underline underline-offset-2"
          >
            {t("common.backToDashboard")}
          </a>
        </section>
      </div>

      <OwnerBottomNavSkin activeTab="accounting" propertySlug={propertySlug} />
      <OwnerPushNotificationPrompts />
    </main>
  );
}

function BillingFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-zinc-500">
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
