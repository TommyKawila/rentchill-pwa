"use client";

import { useLocale } from "@/components/LocaleProvider";
import { PREMIUM_PRICE_THB, TIER_ROOM_LIMITS } from "@/services/planLimits";

interface UpgradePremiumModalSkinProps {
  open: boolean;
  propertySlug?: string;
  onClose: () => void;
}

export function UpgradePremiumModalSkin({
  open,
  propertySlug,
  onClose,
}: UpgradePremiumModalSkinProps) {
  const { t } = useLocale();

  if (!open) return null;

  const billingHref = propertySlug
    ? `/billing?property=${encodeURIComponent(propertySlug)}&plan=premium`
    : "/billing?plan=premium";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-100 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-zinc-500">{t("owner.upgrade.modal.title")}</p>
        <p className="mt-2 text-xl font-bold text-zinc-900">
          {t("owner.upgrade.modal.premiumPrice", { price: String(PREMIUM_PRICE_THB) })}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          {t("owner.upgrade.modal.rooms", { count: TIER_ROOM_LIMITS.premium })}
        </p>
        <a
          href={billingHref}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-zinc-950 text-base font-medium text-white"
        >
          {t("owner.upgrade.cta")}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 flex min-h-12 w-full items-center justify-center text-base text-zinc-500"
        >
          {t("owner.rooms.close")}
        </button>
      </div>
    </div>
  );
}
