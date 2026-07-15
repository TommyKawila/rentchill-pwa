"use client";

import { ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface RoomDetailSectionRowProps {
  title: string;
  summary: string;
  disabled?: boolean;
  onOpen: () => void;
}

export function RoomDetailSectionRow({
  title,
  summary,
  disabled,
  onOpen,
}: RoomDetailSectionRowProps) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <p className="mt-0.5 truncate text-sm text-zinc-500">{summary}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-zinc-600">
        {t("owner.roomDetail.manage")}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}
