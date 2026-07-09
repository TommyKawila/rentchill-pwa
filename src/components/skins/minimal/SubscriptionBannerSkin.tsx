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
      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-900">
          {t("owner.subscription.expiringSoon", {
            tier: t(`owner.plan.tier.${subscription.plan_tier}`),
            days,
          })}
        </p>
        <a
          href={billingHref}
          className="mt-2 inline-block rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-900"
        >
          {t("owner.subscription.renewCta")}
        </a>
      </div>
    );
  }

  if (subscription.phase === "grace") {
    const days = subscription.grace_days_remaining ?? 0;
    return (
      <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-900">
          {t("owner.subscription.grace", {
            tier: t(`owner.plan.tier.${subscription.plan_tier}`),
            days,
          })}
        </p>
        <a
          href={billingHref}
          className="mt-2 inline-block rounded-md border border-red-400 bg-white px-3 py-1.5 text-xs font-medium text-red-900"
        >
          {t("owner.subscription.renewNowCta")}
        </a>
      </div>
    );
  }

  return null;
}
