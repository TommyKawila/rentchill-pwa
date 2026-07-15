"use client";

import { IosAddToHomeGuideSkin } from "@/components/skins/minimal/IosAddToHomeGuideSkin";
import { PushNotificationSoftAskSkin } from "@/components/skins/minimal/PushNotificationSoftAskSkin";
import {
  usePushNotificationPrompt,
  type PushNotificationPromptState,
} from "@/hooks/usePushNotificationPrompt";

interface OwnerPushNotificationPromptsProps {
  push?: PushNotificationPromptState;
}

export function OwnerPushNotificationPrompts({
  push: pushProp,
}: OwnerPushNotificationPromptsProps) {
  const internal = usePushNotificationPrompt();
  const push = pushProp ?? internal;

  return (
    <>
      {push.showSoftAsk && (
        <PushNotificationSoftAskSkin
          requesting={push.requesting}
          onEnable={() => void push.requestPermission()}
          onDismiss={push.dismissSoftAsk}
        />
      )}
      {push.showIosGuide && (
        <IosAddToHomeGuideSkin onDismiss={push.dismissIosGuide} />
      )}
    </>
  );
}
