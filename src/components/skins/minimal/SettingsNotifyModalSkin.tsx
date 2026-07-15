"use client";

import { useLocale } from "@/components/LocaleProvider";
import { OwnerLineNotifySkin } from "@/components/skins/minimal/OwnerLineNotifySkin";
import { PushNotificationStatusSkin } from "@/components/skins/minimal/PushNotificationStatusSkin";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";

interface SettingsNotifyModalSkinProps {
  propertySlug: string;
  ownerLineUserId: string | null;
  pushPermission: NotificationPermission | "unsupported";
  pushConfigured: boolean;
  pushRequesting: boolean;
  onDisconnectLine: () => void;
  onEnablePush: () => void;
  onClose: () => void;
}

export function SettingsNotifyModalSkin({
  propertySlug,
  ownerLineUserId,
  pushPermission,
  pushConfigured,
  pushRequesting,
  onDisconnectLine,
  onEnablePush,
  onClose,
}: SettingsNotifyModalSkinProps) {
  const { t } = useLocale();

  return (
    <SettingsSectionModalShell
      title={t("settings.row.notify")}
      subtitle={t("settings.notifyDesc")}
      onClose={onClose}
    >
      <div className="space-y-4">
        <OwnerLineNotifySkin
          propertySlug={propertySlug}
          ownerLineUserId={ownerLineUserId}
          onDisconnect={onDisconnectLine}
        />
        <PushNotificationStatusSkin
          permission={pushPermission}
          pushConfigured={pushConfigured}
          requesting={pushRequesting}
          onEnable={onEnablePush}
        />
      </div>
    </SettingsSectionModalShell>
  );
}
