"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface RoomDetailSubModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function RoomDetailSubModalShell({
  title,
  subtitle,
  onClose,
  children,
}: RoomDetailSubModalShellProps) {
  const { t } = useLocale();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-200 bg-white shadow-lg sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
