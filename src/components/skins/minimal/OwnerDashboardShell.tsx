"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { ProjectSelectorSkin } from "@/components/skins/minimal/ProjectSelectorSkin";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface OwnerDashboardShellProps {
  propertySlug: string;
  properties: OwnerPropertyOption[];
  propertiesLoading?: boolean;
  onPropertyChange: (slug: string) => void;
  onLogout: () => void;
  pendingCount: number;
  paidCount: number;
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
  pendingCount,
  paidCount,
  onExportCsv,
  csvDisabled,
  csvLoading,
  onOpenShareLink,
  shareDisabled,
  children,
}: OwnerDashboardShellProps) {
  const { t } = useLocale();

  const navItems = [
    { href: "/import", label: t("owner.nav.import"), externalProperty: false },
    {
      href: "/billing",
      label: t("owner.nav.billing"),
      externalProperty: true,
    },
    {
      href: "/settings",
      label: t("owner.nav.settings"),
      externalProperty: true,
    },
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              RentChill
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("owner.dashboard.title")}</h1>

          <ProjectSelectorSkin
            properties={properties}
            value={propertySlug}
            loading={propertiesLoading}
            onChange={onPropertyChange}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-800">{t("owner.pending")}</p>
              <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs text-green-800">{t("owner.paid")}</p>
              <p className="text-2xl font-bold text-green-900">{paidCount}</p>
            </div>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const href = item.externalProperty
                ? `${item.href}?property=${encodeURIComponent(propertySlug)}`
                : item.href;
              return (
                <a
                  key={item.href}
                  href={href}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
                >
                  {item.label}
                </a>
              );
            })}
            {onExportCsv && (
              <button
                type="button"
                disabled={csvDisabled || csvLoading}
                onClick={onExportCsv}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50"
              >
                {csvLoading ? t("owner.csv.exporting") : t("owner.nav.csvExport")}
              </button>
            )}
            {onOpenShareLink && (
              <button
                type="button"
                disabled={shareDisabled}
                onClick={onOpenShareLink}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50"
              >
                {t("owner.nav.shareLink")}
              </button>
            )}
            <a
              href={`/${propertySlug}`}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
            >
              {t("owner.nav.propertyPage")}
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
            >
              {t("owner.nav.logout")}
            </button>
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
