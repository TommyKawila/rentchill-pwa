"use client";

import { useLocale } from "@/components/LocaleProvider";

export type RoomDetailSavingAction = "save" | "issue" | null;

interface RoomDetailBillingFooterSkinProps {
  totalAmount: number;
  metersComplete: boolean;
  includeUtilities: boolean;
  savingAction?: RoomDetailSavingAction;
  disabled?: boolean;
  hasNextRoom?: boolean;
  readyCount?: number;
  onSaveAndNext: () => void;
  onIssueRoom: () => void;
}

export function RoomDetailBillingFooterSkin({
  totalAmount,
  metersComplete,
  includeUtilities,
  savingAction = null,
  disabled,
  hasNextRoom = false,
  readyCount = 0,
  onSaveAndNext,
  onIssueRoom,
}: RoomDetailBillingFooterSkinProps) {
  const { t } = useLocale();
  const busy = savingAction !== null;
  const canAct = metersComplete && !disabled && !busy;

  return (
    <footer className="shrink-0 border-t border-zinc-100 bg-white px-4 py-4">
      <div className="space-y-2">
        <p className="text-base font-bold text-zinc-900">
          {t("common.total")} ฿{totalAmount.toLocaleString("th-TH")}
        </p>
        {metersComplete ? (
          <span className="inline-flex rounded-full border border-rc-green/30 bg-rc-green-soft px-3 py-1 text-sm font-medium text-rc-green-ink">
            {t("owner.roomDetail.readyBadge")}
          </span>
        ) : (
          <p className="text-sm text-red-600">{t("owner.billing.meterRequired")}</p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {includeUtilities ? (
          <button
            type="button"
            disabled={!canAct}
            onClick={onSaveAndNext}
            className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAction === "save"
              ? t("common.saving")
              : hasNextRoom
                ? t("owner.roomDetail.saveAndNext")
                : t("owner.roomDetail.saveAndClose")}
          </button>
        ) : (
          <button
            type="button"
            disabled={!canAct}
            onClick={onIssueRoom}
            className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAction === "issue" ? t("common.saving") : t("owner.roomDetail.issueRoom")}
          </button>
        )}

        {includeUtilities && (
          <button
            type="button"
            disabled={!canAct}
            onClick={onIssueRoom}
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAction === "issue" ? t("common.saving") : t("owner.roomDetail.issueRoom")}
          </button>
        )}

        {metersComplete && readyCount > 1 && (
          <p className="text-sm text-zinc-500">
            {t("owner.roomDetail.bulkHint", { count: readyCount })}
          </p>
        )}
      </div>
    </footer>
  );
}
