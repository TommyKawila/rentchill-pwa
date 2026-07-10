"use client";

import type { ReactNode } from "react";
import {
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Receipt,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { NavMenuItemLabel } from "@/components/skins/minimal/NavMenuItemLabel";
import type { LucideIcon } from "lucide-react";

interface AdminPlatformShellProps {
  children: ReactNode;
  pendingPayments?: number;
  onLogout: () => void;
}

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminPlatformShell({
  children,
  pendingPayments = 0,
  onLogout,
}: AdminPlatformShellProps) {
  const { t } = useLocale();
  const pathname = usePathname();

  const navItems: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
  }> = [
    { href: "/admin", label: t("admin.platform.nav.overview"), icon: LayoutDashboard },
    {
      href: "/admin/slips",
      label: t("admin.platform.nav.slips"),
      icon: Receipt,
      badge: pendingPayments > 0 ? pendingPayments : undefined,
    },
    { href: "/admin/line", label: t("admin.platform.nav.line"), icon: MessageCircle },
  ];

  const navClass = (active: boolean) =>
    [
      "group inline-flex min-h-11 items-center gap-x-3 rounded-full border bg-white px-3 py-1.5 text-xs font-medium",
      active
        ? "border-zinc-900 text-zinc-900"
        : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900",
    ].join(" ");

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
          <h1 className="mt-2 text-2xl font-bold">{t("admin.platform.title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("admin.platform.desc")}</p>

          <nav className="mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <a key={item.href} href={item.href} className={navClass(active)}>
                  <NavMenuItemLabel icon={item.icon} active={active}>
                    {item.label}
                  </NavMenuItemLabel>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
            <button
              type="button"
              onClick={onLogout}
              className={navClass(false)}
            >
              <NavMenuItemLabel icon={LogOut}>{t("owner.nav.logout")}</NavMenuItemLabel>
            </button>
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
