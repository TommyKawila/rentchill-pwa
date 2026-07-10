"use client";

import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { BillingOverviewSkin } from "@/components/skins/minimal/BillingOverviewSkin";
import { EasyModeToggleSkin } from "@/components/skins/minimal/EasyModeToggleSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { NavMenuItemLabel } from "@/components/skins/minimal/NavMenuItemLabel";
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
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium tracking-tight text-green-600">
              RentChill
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={onLogout}
                className="text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline"
              >
                {t("owner.nav.logout")}
              </button>
              <EasyModeToggleSkin />
              <LocaleToggleSkin />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("owner.dashboard.title")}
            </h1>
            <ProjectSelectorSkin
              properties={properties}
              value={propertySlug}
              loading={propertiesLoading}
              onChange={onPropertyChange}
            />
          </div>

          <section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <BillingOverviewSkin billingMonth={billingMonth} overview={overview} />

            <nav className="mt-4 flex gap-2">
              <a
                href={settingsHref}
                className="group flex min-h-11 min-w-0 flex-1 items-center justify-center gap-x-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-medium"
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
    </main>
  );
}
