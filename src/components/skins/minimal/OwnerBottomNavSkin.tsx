"use client";

import { CreditCard, Home, LayoutGrid, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export type OwnerBottomNavTab = "home" | "rooms" | "billing" | "maintenance";

interface OwnerBottomNavSkinProps {
  activeTab: OwnerBottomNavTab;
  propertySlug: string;
}

const TABS: {
  id: OwnerBottomNavTab;
  icon: typeof Home;
  labelKey:
    | "owner.nav.tab.home"
    | "owner.nav.tab.rooms"
    | "owner.nav.tab.billing"
    | "owner.nav.tab.maintenance";
  href: (propertySlug: string) => string;
}[] = [
  {
    id: "home",
    icon: Home,
    labelKey: "owner.nav.tab.home",
    href: (slug) => `/dashboard?property=${encodeURIComponent(slug)}`,
  },
  {
    id: "rooms",
    icon: LayoutGrid,
    labelKey: "owner.nav.tab.rooms",
    href: (slug) =>
      `/dashboard?property=${encodeURIComponent(slug)}#rooms`,
  },
  {
    id: "billing",
    icon: CreditCard,
    labelKey: "owner.nav.tab.billing",
    href: (slug) =>
      `/dashboard?property=${encodeURIComponent(slug)}#billing`,
  },
  {
    id: "maintenance",
    icon: Wrench,
    labelKey: "owner.nav.tab.maintenance",
    href: (slug) => `/maintenance?property=${encodeURIComponent(slug)}`,
  },
];

export function OwnerBottomNavSkin({
  activeTab,
  propertySlug,
}: OwnerBottomNavSkinProps) {
  const { t } = useLocale();

  return (
    <nav
      aria-label={t("owner.nav.tab.home")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-100 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-xl gap-1 px-2 py-2">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          const Icon = tab.icon;
          const tone = active
            ? "text-rc-green"
            : "text-zinc-500 group-hover:text-zinc-900";

          return (
            <a
              key={tab.id}
              href={tab.href(propertySlug)}
              className={`group flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center ${
                active ? "bg-rc-green-soft" : ""
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${tone}`} strokeWidth={1.5} aria-hidden />
              <span className={`truncate text-sm font-medium ${tone}`}>
                {t(tab.labelKey)}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
