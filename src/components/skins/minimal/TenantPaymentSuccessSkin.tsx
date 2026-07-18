"use client";

import { useLocale } from "@/components/LocaleProvider";
import { statusMessageKey } from "@/services/i18n/translate";

export function TenantPaymentSuccessSkin() {
  const { t } = useLocale();

  return (
    <div className="mx-6 mb-6 rounded-xl border border-rc-success/30 bg-rc-success-soft p-6 text-center">
      <div
        aria-hidden
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rc-success-soft text-2xl text-rc-success-ink"
      >
        ✓
      </div>
      <p className="mt-4 text-lg font-bold text-rc-success-ink">
        {t("tenant.invoice.successTitle")}
      </p>
      <p className="mt-2 text-base text-rc-success-ink">
        {t("tenant.invoice.successBody")}
      </p>
    </div>
  );
}
