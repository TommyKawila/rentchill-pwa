"use client";

import { useCallback, useEffect, useState } from "react";
import { syncOwnerPushSubscription } from "@/services/pushClientService";

const SOFT_ASK_KEY = "rentchill_push_soft_ask_dismissed";
const IOS_GUIDE_KEY = "rentchill_ios_a2hs_dismissed";

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function usePushNotificationPrompt() {
  const [showSoftAsk, setShowSoftAsk] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default",
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    if (Notification.permission === "granted") {
      void syncOwnerPushSubscription();
    }

    if (isIosSafari() && !isStandalonePwa()) {
      if (!sessionStorage.getItem(IOS_GUIDE_KEY)) {
        setShowIosGuide(true);
      }
      return;
    }

    if (Notification.permission === "default" && !sessionStorage.getItem(SOFT_ASK_KEY)) {
      setShowSoftAsk(true);
    }
  }, []);

  const dismissSoftAsk = useCallback(() => {
    sessionStorage.setItem(SOFT_ASK_KEY, "1");
    setShowSoftAsk(false);
  }, []);

  const dismissIosGuide = useCallback(() => {
    sessionStorage.setItem(IOS_GUIDE_KEY, "1");
    setShowIosGuide(false);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      sessionStorage.setItem(SOFT_ASK_KEY, "1");
      setShowSoftAsk(false);
      if (result === "granted") {
        await syncOwnerPushSubscription();
      }
    } finally {
      setRequesting(false);
    }
  }, []);

  return {
    permission,
    showSoftAsk,
    showIosGuide,
    requesting,
    dismissSoftAsk,
    dismissIosGuide,
    requestPermission,
  };
}

export type PushNotificationPromptState = ReturnType<typeof usePushNotificationPrompt>;
