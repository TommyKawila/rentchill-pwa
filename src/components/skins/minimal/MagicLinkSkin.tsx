"use client";

import { useLocale } from "@/components/LocaleProvider";

interface MagicLinkSkinProps {
  disabled?: boolean;
  linkUrl?: string | null;
  expiresAt?: string | null;
  isPermanent?: boolean;
  copied?: boolean;
  onCreate: () => void;
  onCopy: () => void;
}

export function MagicLinkSkin({
  disabled,
  linkUrl,
  expiresAt,
  isPermanent,
  copied,
  onCreate,
  onCopy,
}: MagicLinkSkinProps) {
  const { t } = useLocale();

  return (
    <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-800">{t("owner.share.title")}</h2>
      <p className="mt-1 text-xs text-zinc-500">{t("owner.share.desc")}</p>
      <p className="mt-2 text-xs text-amber-800">{t("owner.share.quotaHint")}</p>

      {linkUrl ? (
        <div className="mt-3 space-y-2">
          <p className="hidden break-all text-xs text-zinc-600 md:block">{linkUrl}</p>
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
          className="mt-3 w-full rounded-md border border-zinc-300 bg-zinc-50 py-2.5 text-sm font-medium text-zinc-800 disabled:opacity-50"
        >
          {t("owner.share.create")}
        </button>
      )}
    </section>
  );
}
