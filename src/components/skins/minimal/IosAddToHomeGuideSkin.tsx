"use client";

import { useLocale } from "@/components/LocaleProvider";

interface IosAddToHomeGuideSkinProps {
  onDismiss: () => void;
}

export function IosAddToHomeGuideSkin({ onDismiss }: IosAddToHomeGuideSkinProps) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("push.softAsk.secondary")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onDismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-xl border border-zinc-200 bg-white p-6 sm:rounded-xl"
      >
        <h2 className="text-base font-semibold text-zinc-900">{t("push.ios.title")}</h2>
        <p className="mt-2 text-base text-zinc-600">{t("push.ios.body")}</p>

        <ol className="mt-4 list-decimal space-y-3 pl-5 text-base text-zinc-700">
          <li>{t("push.ios.step1")}</li>
          <li>{t("push.ios.step2")}</li>
          <li>{t("push.ios.step3")}</li>
        </ol>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark"
        >
          {t("push.ios.done")}
        </button>
      </div>
    </div>
  );
}
