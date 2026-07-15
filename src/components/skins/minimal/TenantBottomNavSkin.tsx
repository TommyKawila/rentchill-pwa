"use client";

import { CreditCard, FileText, MessageCircle, Wrench } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type {
  TenantBoardTab,
  TenantNavBadges,
} from "@/services/tenantBoardNavService";

interface TenantBottomNavSkinProps {
  activeTab: TenantBoardTab;
  badges: TenantNavBadges;
  onTabChange: (tab: TenantBoardTab) => void;
}

const TABS: {
  id: TenantBoardTab;
  icon: typeof CreditCard;
  labelKey:
    | "tenant.nav.tab.bill"
    | "tenant.nav.tab.maintenance"
    | "tenant.nav.tab.contact"
    | "tenant.nav.tab.documents";
}[] = [
  { id: "bill", icon: CreditCard, labelKey: "tenant.nav.tab.bill" },
  { id: "maintenance", icon: Wrench, labelKey: "tenant.nav.tab.maintenance" },
  { id: "contact", icon: MessageCircle, labelKey: "tenant.nav.tab.contact" },
  { id: "documents", icon: FileText, labelKey: "tenant.nav.tab.documents" },
];

function NavBadge({
  billBadge,
  count,
  dot,
}: {
  billBadge?: "pending" | "scanning" | null;
  count?: number;
  dot?: boolean;
}) {
  if (billBadge === "pending") {
    return (
      <span
        className="absolute right-2 top-1 h-2 w-2 rounded-full bg-amber-500"
        aria-hidden
      />
    );
  }
  if (billBadge === "scanning") {
    return (
      <span
        className="absolute right-2 top-1 h-2 w-2 rounded-full bg-sky-500"
        aria-hidden
      />
    );
  }
  if (count != null && count > 0) {
    return (
      <span className="absolute right-1 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
        {count > 9 ? "9+" : count}
      </span>
    );
  }
  if (dot) {
    return (
      <span
        className="absolute right-2 top-1 h-2 w-2 rounded-full bg-amber-500"
        aria-hidden
      />
    );
  }
  return null;
}

export function TenantBottomNavSkin({
  activeTab,
  badges,
  onTabChange,
}: TenantBottomNavSkinProps) {
  const { t } = useLocale();

  return (
    <nav
      aria-label={t("tenant.nav.ariaLabel")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-100 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md gap-1 px-2 py-2">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          const Icon = tab.icon;
          const tone = active
            ? "text-rc-green"
            : "text-zinc-500 group-hover:text-zinc-900";

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center ${
                active ? "bg-rc-green-soft" : ""
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${tone}`} strokeWidth={1.5} aria-hidden />
              <span className={`truncate text-sm font-medium ${tone}`}>
                {t(tab.labelKey)}
              </span>
              {tab.id === "bill" && <NavBadge billBadge={badges.bill} />}
              {tab.id === "maintenance" && (
                <NavBadge count={badges.maintenance} />
              )}
              {tab.id === "documents" && <NavBadge dot={badges.documents} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
