"use client";

import { useLocale } from "@/components/LocaleProvider";

interface ContactAdminOverflowModalSkinProps {
  open: boolean;
  onClose: () => void;
  onContact: () => void;
}

export function ContactAdminOverflowModalSkin({
  open,
  onClose,
  onContact,
}: ContactAdminOverflowModalSkinProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-100 bg-white p-6 shadow-lg">
        <p className="text-base font-bold text-zinc-950">
          {t("owner.overflow.modal.title")}
        </p>
        <p className="mt-3 text-base text-zinc-500">
          {t("owner.overflow.modal.subtitle")}
        </p>
        <button
          type="button"
          onClick={onContact}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-zinc-950 text-base font-bold text-white hover:bg-zinc-900"
        >
          {t("owner.overflow.modal.cta")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 flex min-h-12 w-full items-center justify-center text-base text-zinc-500"
        >
          {t("owner.rooms.close")}
        </button>
      </div>
    </div>
  );
}
