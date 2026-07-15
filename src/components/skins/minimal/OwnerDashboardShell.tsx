"use client";

import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { BillingOverviewSkin } from "@/components/skins/minimal/BillingOverviewSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { NavMenuItemLabel } from "@/components/skins/minimal/NavMenuItemLabel";
import {
  OwnerBottomNavSkin,
  type OwnerBottomNavTab,
} from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { OwnerToolsMenuSkin } from "@/components/skins/minimal/OwnerToolsMenuSkin";
import { ProjectSelectorSkin } from "@/components/skins/minimal/ProjectSelectorSkin";
import { usePushNotificationPrompt } from "@/hooks/usePushNotificationPrompt";
import type { BillingOverview } from "@/services/billingOverviewService";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface OwnerDashboardShellProps {
  propertySlug: string;
  properties: OwnerPropertyOption[];
  propertiesLoading?: boolean;
  onPropertyChange: (slug: string) => void;
  onLogout: () => void;
  billingMonth: string;
  overview: BillingOverview;
  chillMode?: boolean;
  onExportCsv?: () => void;
  csvDisabled?: boolean;
  csvLoading?: boolean;
  onOpenShareLink?: () => void;
  shareDisabled?: boolean;
  planUsage?: ReactNode;
  trialBanner?: ReactNode;
  planSwitcher?: ReactNode;
  tenantViewUrl?: string;
  activeTab?: OwnerBottomNavTab;
  children: ReactNode;
}

export function OwnerDashboardShell({
  propertySlug,
  properties,
  propertiesLoading,
  onPropertyChange,
  onLogout,
  billingMonth,
  overview,
  chillMode = false,
  onExportCsv,
  csvDisabled,
  csvLoading,
  onOpenShareLink,
  shareDisabled,
  planUsage,
  trialBanner,
  planSwitcher,
  tenantViewUrl,
  activeTab = "home",
  children,
}: OwnerDashboardShellProps) {
  const { t } = useLocale();
  const settingsHref = `/settings?property=${encodeURIComponent(propertySlug)}`;
  const push = usePushNotificationPrompt();

  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-24 text-zinc-900">
      <div className="mx-auto max-w-xl space-y-6">
        {trialBanner}
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-medium tracking-tight text-green-600">
                RentChill
              </p>
              <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-sm font-medium uppercase tracking-wide text-zinc-500">
                {t("owner.dashboard.roleBadge")}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-12 items-center text-base text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline"
              >
                {t("owner.nav.logout")}
              </button>
              <LocaleToggleSkin />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="min-w-0 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {t("owner.dashboard.title")}
              </h1>
              {planUsage && <div className="shrink-0">{planUsage}</div>}
            </div>
            <ProjectSelectorSkin
              layout="inline"
              properties={properties}
              value={propertySlug}
              loading={propertiesLoading}
              onChange={onPropertyChange}
            />
            {planSwitcher}
            {tenantViewUrl && (
              <a
                href={tenantViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-base font-medium text-zinc-800"
              >
                {t("trial.tenantView")}
              </a>
            )}
          </div>

          <section className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
            <BillingOverviewSkin
              billingMonth={billingMonth}
              overview={overview}
              chillMode={chillMode}
            />

            <nav className="mt-4 flex gap-3">
              <a
                href={settingsHref}
                className="group flex min-h-12 min-w-0 flex-1 items-center justify-center gap-x-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base font-medium"
              >
                <NavMenuItemLabel icon={Settings}>
                  {t("owner.nav.settingsShort")}
                </NavMenuItemLabel>
              </a>
              <OwnerToolsMenuSkin
                propertySlug={propertySlug}
                onExportCsv={onExportCsv}
                csvDisabled={csvDisabled}
                csvLoading={csvLoading}
                onOpenShareLink={onOpenShareLink}
                shareDisabled={shareDisabled}
              />
            </nav>
          </section>
        </header>

        {children}
      </div>

      <OwnerBottomNavSkin activeTab={activeTab} propertySlug={propertySlug} />

      <OwnerPushNotificationPrompts push={push} />
    </main>
  );
}
