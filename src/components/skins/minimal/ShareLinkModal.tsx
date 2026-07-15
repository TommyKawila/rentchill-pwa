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
        className="relative z-10 w-full max-w-xl rounded-t-xl border border-zinc-200 bg-white sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 p-6 pb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{t("owner.share.title")}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t("owner.share.desc")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center rounded-lg px-3 text-base text-zinc-500 hover:bg-zinc-50"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="space-y-3 p-6 pt-4 text-base">
          <p className="text-sm text-zinc-600">{t("owner.share.help")}</p>
          <p className="text-sm text-amber-800">{t("owner.share.quotaHint")}</p>

          {linkUrl ? (
            <div className="space-y-3">
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm text-green-700 underline"
              >
                {linkUrl}
              </a>
              {isPermanent ? (
                <p className="text-sm text-green-700">{t("owner.share.permanent")}</p>
              ) : expiresAt ? (
                <p className="text-sm text-amber-700">
                  {t("owner.share.expires", {
                    date: new Date(expiresAt).toLocaleString(),
                  })}
                </p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onCopy}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-green-300 bg-green-50 text-base font-medium text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied ? t("owner.share.copied") : t("owner.share.copy")}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onCreate}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="flex min-h-14 w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {disabled ? t("common.saving") : t("owner.share.create")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
