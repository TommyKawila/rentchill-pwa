"use client";

import { Home, Lock, Receipt, Settings, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export type OwnerBottomNavTab =
  | "home"
  | "accounting"
  | "maintenance"
  | "settings";

interface OwnerBottomNavSkinProps {
  activeTab: OwnerBottomNavTab;
  propertySlug: string;
  lockedTabs?: Partial<Record<OwnerBottomNavTab, string>>;
}

const TABS: {
  id: OwnerBottomNavTab;
  icon: typeof Home;
  labelKey:
    | "owner.nav.tab.home"
    | "owner.nav.tab.accounting"
    | "owner.nav.tab.maintenance"
    | "owner.nav.tab.settings";
  href: (propertySlug: string) => string;
}[] = [
  {
    id: "home",
    icon: Home,
    labelKey: "owner.nav.tab.home",
    href: (slug) => `/dashboard?property=${encodeURIComponent(slug)}`,
  },
  {
    id: "accounting",
    icon: Receipt,
    labelKey: "owner.nav.tab.accounting",
    href: (slug) =>
      `/dashboard?property=${encodeURIComponent(slug)}#billing`,
  },
  {
    id: "maintenance",
    icon: Wrench,
    labelKey: "owner.nav.tab.maintenance",
    href: (slug) => `/maintenance?property=${encodeURIComponent(slug)}`,
  },
  {
    id: "settings",
    icon: Settings,
    labelKey: "owner.nav.tab.settings",
    href: (slug) => `/settings?property=${encodeURIComponent(slug)}`,
  },
];

export function OwnerBottomNavSkin({
  activeTab,
  propertySlug,
  lockedTabs,
}: OwnerBottomNavSkinProps) {
  const { t } = useLocale();

  return (
    <nav
      aria-label={t("owner.nav.tab.home")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-100 bg-white pb-[env(safe-area-inset-bottom)] print:hidden"
    >
      <div className="mx-auto flex max-w-xl gap-1 px-2 py-2">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          const Icon = tab.icon;
          const lockHref = lockedTabs?.[tab.id];
          const tone = active
            ? "text-rc-primary"
            : "text-zinc-500 group-hover:text-zinc-900";

          if (lockHref) {
            return (
              <a
                key={tab.id}
                href={lockHref}
                className="group flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-center"
              >
                <Lock className={`h-5 w-5 shrink-0 ${tone}`} strokeWidth={1.5} aria-hidden />
                <span className={`truncate text-xs font-medium ${tone}`}>
                  {t(tab.labelKey)}
                </span>
              </a>
            );
          }

          return (
            <a
              key={tab.id}
              href={tab.href(propertySlug)}
              className={`group flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-center ${
                active ? "bg-rc-primary-soft" : ""
              }`}
            >
              <Icon className={`h-6 w-6 shrink-0 ${tone}`} strokeWidth={1.5} aria-hidden />
              <span className={`truncate text-xs font-medium ${tone}`}>
                {t(tab.labelKey)}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
