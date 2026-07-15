"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface MeterEntryChoiceSheetSkinProps {
  open: boolean;
  disabled?: boolean;
  saving?: boolean;
  onClose: () => void;
  onChooseList: () => void;
  onChooseWalkthrough: () => void;
}

export function MeterEntryChoiceSheetSkin({
  open,
  disabled,
  saving,
  onClose,
  onChooseList,
  onChooseWalkthrough,
}: MeterEntryChoiceSheetSkinProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const optionClass =
    "flex min-h-12 w-full flex-col items-start justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50";

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
        aria-labelledby="meter-entry-sheet-title"
        className="relative z-10 w-full max-w-sm rounded-t-xl border border-zinc-200 bg-white p-6 sm:rounded-xl"
      >
        <h2
          id="meter-entry-sheet-title"
          className="text-base font-semibold tracking-tight text-zinc-900"
        >
          {t("owner.meterEntry.sheetTitle")}
        </h2>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            disabled={disabled || saving}
            onClick={() => {
              onChooseList();
              onClose();
            }}
            className={optionClass}
          >
            <span className="text-base font-medium text-zinc-900">
              {t("owner.meterEntry.fromList")}
            </span>
            <span className="text-sm text-zinc-500">{t("owner.meterEntry.fromListDesc")}</span>
          </button>

          <button
            type="button"
            disabled={disabled || saving}
            onClick={() => {
              onChooseWalkthrough();
              onClose();
            }}
            className={optionClass}
          >
            <span className="text-base font-medium text-zinc-900">
              {t("owner.meterEntry.walkthrough")}
            </span>
            <span className="text-sm text-zinc-500">
              {t("owner.meterEntry.walkthroughDesc")}
            </span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.tenant.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
