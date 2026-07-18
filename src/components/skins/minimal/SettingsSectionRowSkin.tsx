"use client";

import { ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface SettingsSectionRowSkinProps {
  id?: string;
  title: string;
  summary: string;
  actionLabel?: string;
  disabled?: boolean;
  highlighted?: boolean;
  onOpen: () => void;
}

export function SettingsSectionRowSkin({
  id,
  title,
  summary,
  actionLabel,
  disabled,
  highlighted,
  onOpen,
}: SettingsSectionRowSkinProps) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={onOpen}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
        highlighted
          ? "border-rc-green/40 bg-rc-green-soft"
          : "border-zinc-100 bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <p className="mt-0.5 truncate text-sm text-zinc-500">
          {summary || t("settings.summary.empty")}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-zinc-600">
        {actionLabel ?? t("settings.row.edit")}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}
