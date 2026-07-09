"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { BillingOverviewSkin } from "@/components/skins/minimal/BillingOverviewSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { OwnerToolsMenuSkin } from "@/components/skins/minimal/OwnerToolsMenuSkin";
import { ProjectSelectorSkin } from "@/components/skins/minimal/ProjectSelectorSkin";
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
  onExportCsv?: () => void;
  csvDisabled?: boolean;
  csvLoading?: boolean;
  onOpenShareLink?: () => void;
  shareDisabled?: boolean;
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
  onExportCsv,
  csvDisabled,
  csvLoading,
  onOpenShareLink,
  shareDisabled,
  children,
}: OwnerDashboardShellProps) {
  const { t } = useLocale();
  const settingsHref = `/settings?property=${encodeURIComponent(propertySlug)}`;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              RentChill
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline"
              >
                {t("owner.nav.logout")}
              </button>
              <LocaleToggleSkin />
            </div>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("owner.dashboard.title")}</h1>

          <ProjectSelectorSkin
            properties={properties}
            value={propertySlug}
            loading={propertiesLoading}
            onChange={onPropertyChange}
          />

          <BillingOverviewSkin billingMonth={billingMonth} overview={overview} />

          <nav className="mt-4 flex gap-2">
            <a
              href={settingsHref}
              className="min-w-0 flex-1 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-center text-xs font-medium text-green-800"
            >
              {t("owner.nav.settingsShort")}
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
        </header>

        {children}
      </div>
    </main>
  );
}
