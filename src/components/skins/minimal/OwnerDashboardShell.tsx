"use client";

import type { ReactNode } from "react";
import {
  OwnerBottomNavSkin,
  type OwnerBottomNavTab,
} from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { usePushNotificationPrompt } from "@/hooks/usePushNotificationPrompt";

interface OwnerDashboardShellProps {
  propertySlug: string;
  trialBanner?: ReactNode;
  activeTab?: OwnerBottomNavTab;
  navLockedTabs?: Partial<Record<OwnerBottomNavTab, string>>;
  children: ReactNode;
}

export function OwnerDashboardShell({
  propertySlug,
  trialBanner,
  activeTab = "home",
  navLockedTabs,
  children,
}: OwnerDashboardShellProps) {
  const push = usePushNotificationPrompt();

  return (
    <main className="min-h-screen bg-rc-bg px-4 py-4 pb-24 text-rc-text">
      <div className="mx-auto max-w-xl space-y-4">
        {trialBanner}
        {children}
      </div>

      <OwnerBottomNavSkin
        activeTab={activeTab}
        propertySlug={propertySlug}
        lockedTabs={navLockedTabs}
      />

      <OwnerPushNotificationPrompts push={push} />
    </main>
  );
}
