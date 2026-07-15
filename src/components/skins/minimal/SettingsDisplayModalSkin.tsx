"use client";

import { useLocale } from "@/components/LocaleProvider";
import { BillingMonthFormatSkin } from "@/components/skins/minimal/BillingMonthFormatSkin";
import { EasyReadModeSkin } from "@/components/skins/minimal/EasyReadModeSkin";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import type { BillingMonthDisplayFormat } from "@/services/billingMonthDisplayService";

interface SettingsDisplayModalSkinProps {
  format: BillingMonthDisplayFormat;
  easyMode: boolean;
  onFormatChange: (format: BillingMonthDisplayFormat) => void;
  onEasyModeChange: (enabled: boolean) => void;
  onClose: () => void;
}

export function SettingsDisplayModalSkin({
  format,
  easyMode,
  onFormatChange,
  onEasyModeChange,
  onClose,
}: SettingsDisplayModalSkinProps) {
  const { t } = useLocale();

  return (
    <SettingsSectionModalShell
      title={t("settings.displayTitle")}
      subtitle={t("settings.displayDesc")}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-zinc-700">
            {t("settings.monthFormatSection")}
          </p>
          <div className="mt-2">
            <BillingMonthFormatSkin format={format} onChange={onFormatChange} />
          </div>
        </div>
        <div className="border-t border-zinc-100 pt-4">
          <p className="text-sm font-medium text-zinc-700">{t("settings.easyReadTitle")}</p>
          <div className="mt-2">
            <EasyReadModeSkin enabled={easyMode} onChange={onEasyModeChange} />
          </div>
        </div>
      </div>
    </SettingsSectionModalShell>
  );
}
