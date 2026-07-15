"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { OwnerSubscription } from "@/services/platformPaymentService";

interface SubscriptionBannerSkinProps {
  subscription: OwnerSubscription;
  propertySlug?: string;
}

export function SubscriptionBannerSkin({
  subscription,
  propertySlug = "demo-apartment",
}: SubscriptionBannerSkinProps) {
  const { t } = useLocale();
  const billingHref = `/billing?property=${encodeURIComponent(propertySlug)}`;

  if (subscription.phase === "expiring_soon") {
    const days = subscription.days_until_expiry ?? 0;
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-amber-900">
          {t("owner.subscription.expiringSoon", {
            tier: t(`owner.plan.tier.${subscription.plan_tier}`),
            days,
          })}
        </p>
        <a
          href={billingHref}
          className="mt-2 inline-flex min-h-12 items-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-base font-medium text-amber-900"
        >
          {t("owner.subscription.renewCta")}
        </a>
      </div>
    );
  }

  if (subscription.phase === "grace") {
    const days = subscription.grace_days_remaining ?? 0;
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-red-900">
          {t("owner.subscription.grace", {
            tier: t(`owner.plan.tier.${subscription.plan_tier}`),
            days,
          })}
        </p>
        <a
          href={billingHref}
          className="mt-2 inline-flex min-h-12 items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-base font-medium text-red-900"
        >
          {t("owner.subscription.renewNowCta")}
        </a>
      </div>
    );
  }

  return null;
}
