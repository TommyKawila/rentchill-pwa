"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

export const SLIP_REJECT_REASONS = {
  insufficient: "ยอดเงินไม่ครบ",
  notSlip: "รูปภาพไม่ใช่สลิป",
  other: "อื่นๆ",
} as const;

type RejectReasonKey = keyof typeof SLIP_REJECT_REASONS;

interface SlipRejectReasonSkinProps {
  busy?: boolean;
  saving?: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export function SlipRejectReasonSkin({
  busy,
  saving,
  onConfirm,
  onCancel,
}: SlipRejectReasonSkinProps) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<RejectReasonKey | null>(null);
  const [otherNote, setOtherNote] = useState("");

  const confirmDisabled =
    busy ||
    saving ||
    !selected ||
    (selected === "other" && !otherNote.trim());

  const handleConfirm = () => {
    if (!selected) return;
    const note =
      selected === "other"
        ? otherNote.trim()
        : SLIP_REJECT_REASONS[selected];
    onConfirm(note);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-t-xl border border-zinc-100 bg-white p-4 sm:rounded-xl"
      >
        <p className="text-base font-semibold text-zinc-900">
          {t("owner.slipVerify.rejectTitle")}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{t("owner.slipVerify.rejectHint")}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(SLIP_REJECT_REASONS) as RejectReasonKey[]).map((key) => (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => setSelected(key)}
              className={`min-h-12 rounded-full border px-4 text-sm font-medium transition-colors ${
                selected === key
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-zinc-100 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {t(`owner.slipVerify.rejectReason.${key}`)}
            </button>
          ))}
        </div>

        {selected === "other" && (
          <textarea
            value={otherNote}
            disabled={busy}
            onChange={(event) => setOtherNote(event.target.value)}
            placeholder={t("owner.slipVerify.rejectOtherPlaceholder")}
            rows={3}
            className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base"
          />
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-12 flex-1 rounded-lg border border-zinc-200 text-base font-medium text-zinc-700"
          >
            {t("owner.invoiceGen.previewCancel")}
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={handleConfirm}
            className="min-h-12 flex-1 rounded-lg bg-red-600 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t("common.saving") : t("owner.slipVerify.rejectConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
