"use client";

import { useLocale } from "@/components/LocaleProvider";

export function OwnerSlipApprovedSkin() {
  const { t } = useLocale();

  return (
    <div className="rounded-xl border border-rc-success/30 bg-rc-success-soft p-6 text-center">
      <div
        aria-hidden
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rc-success-soft text-2xl text-rc-success-ink"
      >
        ✓
      </div>
      <p className="mt-4 text-lg font-bold text-rc-success-ink">
        {t("owner.slipVerify.successTitle")}
      </p>
      <p className="mt-2 text-base text-rc-success-ink">
        {t("owner.slipVerify.successBody")}
      </p>
    </div>
  );
}
