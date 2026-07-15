"use client";

import { useLocale } from "@/components/LocaleProvider";
import { BrandLogoSkin } from "@/components/skins/minimal/BrandLogoSkin";

interface BillingQuestRewardSkinProps {
  open: boolean;
  onDismiss: () => void;
}

export function BillingQuestRewardSkin({
  open,
  onDismiss,
}: BillingQuestRewardSkinProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 px-6 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-reward-title"
    >
      <div className="w-full max-w-sm text-center transition-transform duration-300">
        <div className="flex justify-center [&_img]:brightness-0 [&_img]:saturate-100 [&_img]:[filter:invert(48%)_sepia(79%)_saturate(2476%)_hue-rotate(86deg)_brightness(95%)_contrast(85%)]">
          <BrandLogoSkin size="md" showWordmark={false} />
        </div>
        <h2
          id="quest-reward-title"
          className="mt-6 text-xl font-bold tracking-tight text-zinc-900"
        >
          {t("owner.quest.rewardTitle")}
        </h2>
        <p className="mt-2 text-base text-zinc-500">{t("owner.quest.rewardBody")}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark"
        >
          {t("owner.quest.rewardDismiss")}
        </button>
      </div>
    </div>
  );
}
