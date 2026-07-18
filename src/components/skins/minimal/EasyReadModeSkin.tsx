"use client";

import { useLocale } from "@/components/LocaleProvider";

interface EasyReadModeSkinProps {
  enabled: boolean;
  onChange: (on: boolean) => void;
}

export function EasyReadModeSkin({ enabled, onChange }: EasyReadModeSkinProps) {
  const { t } = useLocale();

  return (
    <div>
      <label className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 text-base">
        <span className="font-medium text-zinc-900">{t("settings.easyReadTitle")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t("settings.easyReadTitle")}
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full px-1 transition ${
            enabled ? "bg-rc-green" : "bg-zinc-300"
          }`}
        >
          <span
            className={`h-6 w-6 rounded-full bg-white transition ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </label>
      <p className="mt-1 text-sm text-zinc-500">
        {enabled ? t("settings.easyReadOn") : t("settings.easyReadOff")}
      </p>
    </div>
  );
}
