"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface ShareLinkModalProps {
  disabled?: boolean;
  linkUrl?: string | null;
  expiresAt?: string | null;
  isPermanent?: boolean;
  copied?: boolean;
  onClose: () => void;
  onCreate: () => void;
  onCopy: () => void;
}

export function ShareLinkModal({
  disabled,
  linkUrl,
  expiresAt,
  isPermanent,
  copied,
  onClose,
  onCreate,
  onCopy,
}: ShareLinkModalProps) {
  const { t } = useLocale();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl rounded-t-xl border border-zinc-200 bg-white shadow-lg sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{t("owner.share.title")}</h2>
            <p className="mt-1 text-xs text-zinc-500">{t("owner.share.desc")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="space-y-3 px-4 py-4 text-sm">
          <p className="text-xs text-zinc-600">{t("owner.share.help")}</p>
          <p className="text-xs text-amber-800">{t("owner.share.quotaHint")}</p>

          {linkUrl ? (
            <div className="space-y-2">
              <p className="break-all text-xs text-zinc-600">{linkUrl}</p>
              {isPermanent ? (
                <p className="text-xs text-green-700">{t("owner.share.permanent")}</p>
              ) : expiresAt ? (
                <p className="text-xs text-amber-700">
                  {t("owner.share.expires", {
                    date: new Date(expiresAt).toLocaleString(),
                  })}
                </p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onCopy}
                  className="flex-1 rounded-md border border-green-300 bg-green-50 py-2 text-sm font-medium text-green-800 disabled:opacity-50"
                >
                  {copied ? t("owner.share.copied") : t("owner.share.copy")}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onCreate}
                  className="flex-1 rounded-md border border-zinc-300 bg-white py-2 text-sm font-medium text-zinc-800 disabled:opacity-50"
                >
                  {t("owner.share.regenerate")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={onCreate}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 py-2.5 text-sm font-medium text-zinc-800 disabled:opacity-50"
            >
              {t("owner.share.create")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
