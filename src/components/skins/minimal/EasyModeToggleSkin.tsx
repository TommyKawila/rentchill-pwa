"use client";

import { useEasyMode } from "@/components/EasyModeProvider";
import { useLocale } from "@/components/LocaleProvider";

export function EasyModeToggleSkin() {
  const { t } = useLocale();
  const { easyMode, setEasyMode } = useEasyMode();

  return (
    <button
      type="button"
      aria-pressed={easyMode}
      onClick={() => setEasyMode(!easyMode)}
      className={
        easyMode
          ? "rounded-lg border border-amber-400 bg-amber-50 px-3 py-2.5 font-semibold text-amber-950"
          : "rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-medium text-zinc-700"
      }
    >
      {easyMode ? t("a11y.easyMode.on") : t("a11y.easyMode.label")}
    </button>
  );
}
