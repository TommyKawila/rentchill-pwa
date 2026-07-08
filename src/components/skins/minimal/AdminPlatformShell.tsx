"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface AdminPlatformShellProps {
  children: ReactNode;
  pendingPayments?: number;
  onLogout: () => void;
}

export function AdminPlatformShell({
  children,
  pendingPayments = 0,
  onLogout,
}: AdminPlatformShellProps) {
  const { t } = useLocale();

  const navItems: Array<{ href: string; label: string; badge?: number }> = [
    { href: "/admin", label: t("admin.platform.nav.overview") },
    {
      href: "/admin/slips",
      label: t("admin.platform.nav.slips"),
      badge: pendingPayments > 0 ? pendingPayments : undefined,
    },
  ];

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
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
              >
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
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
