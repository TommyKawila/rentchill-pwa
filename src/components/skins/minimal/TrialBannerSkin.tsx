"use client";

import { useLocale } from "@/components/LocaleProvider";

interface TrialBannerSkinProps {
  resetExpiresAt?: string | null;
}

export function TrialBannerSkin({ resetExpiresAt }: TrialBannerSkinProps) {
  const { t } = useLocale();

  const resetLabel = resetExpiresAt
    ? new Date(resetExpiresAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">{t("trial.banner.title")}</p>
      <p className="mt-1 text-xs text-amber-800">
        {resetLabel
          ? t("trial.banner.resetAt", { time: resetLabel })
          : t("trial.banner.desc")}
      </p>
    </div>
  );
}
