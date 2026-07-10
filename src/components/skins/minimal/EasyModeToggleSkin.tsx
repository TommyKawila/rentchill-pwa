"use client";

import { useEasyMode } from "@/components/EasyModeProvider";
import { useLocale } from "@/components/LocaleProvider";
import { SeniorModeIcon } from "@/components/skins/minimal/SeniorModeIcon";

export function EasyModeToggleSkin() {
  const { t } = useLocale();
  const { easyMode, setEasyMode } = useEasyMode();

  const iconClass = easyMode
    ? "h-5 w-5 shrink-0 text-amber-900"
    : "h-5 w-5 shrink-0 text-zinc-500 group-hover:text-zinc-900";

  return (
    <button
      type="button"
      aria-pressed={easyMode}
      aria-label={easyMode ? t("a11y.easyMode.on") : t("a11y.easyMode.label")}
      onClick={() => setEasyMode(!easyMode)}
      className={
        easyMode
          ? "group inline-flex min-h-11 items-center gap-x-2 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2.5 font-semibold text-amber-950"
          : "group inline-flex min-h-11 items-center gap-x-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-medium text-zinc-700 hover:text-zinc-900"
      }
    >
      <SeniorModeIcon className={iconClass} />
      <span>{easyMode ? t("a11y.easyMode.on") : t("a11y.easyMode.label")}</span>
    </button>
  );
}
