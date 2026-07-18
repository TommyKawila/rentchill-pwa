"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface DashboardHeaderSkinProps {
  ownerName: string;
}

function ownerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function DashboardHeaderSkin({ ownerName }: DashboardHeaderSkinProps) {
  const { t } = useLocale();

  return (
    <header className="flex min-h-[60px] items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rc-primary-soft text-sm font-bold text-rc-primary"
          aria-hidden
        >
          {ownerInitials(ownerName)}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{t("owner.dashboard.greeting")}</p>
          <p className="truncate text-base font-bold text-rc-text">{ownerName}</p>
        </div>
      </div>
      <LocaleToggleSkin compact />
    </header>
  );
}
