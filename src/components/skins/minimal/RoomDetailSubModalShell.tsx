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
        className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-200 bg-white sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 p-6 pb-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 shrink-0 items-center rounded-lg border border-zinc-200 px-4 text-base font-medium text-zinc-600"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="overflow-y-auto p-6 pt-0">{children}</div>
      </div>
    </div>
  );
}
