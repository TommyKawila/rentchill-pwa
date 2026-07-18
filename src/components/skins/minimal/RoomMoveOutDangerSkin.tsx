"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import type { MessageKey } from "@/services/i18n/messages";
import type { InvoiceStatus } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface RoomMoveOutDangerSkinProps {
  roomNumber: string;
  invoiceStatus: InvoiceStatus | null;
  saving: boolean;
  errorKey?: MessageKey | null;
  onMoveOut: () => Promise<void>;
}

export function RoomMoveOutDangerSkin({
  roomNumber,
  invoiceStatus,
  saving,
  errorKey,
  onMoveOut,
}: RoomMoveOutDangerSkinProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [confirmNumber, setConfirmNumber] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const blocked =
    invoiceStatus === "pending" || invoiceStatus === "scanning";
  const blockKey: MessageKey | null = blocked
    ? invoiceStatus === "scanning"
      ? "owner.roomLifecycle.blockScanning"
      : "owner.roomLifecycle.blockUnpaid"
    : null;

  const canConfirm =
    confirmNumber.trim() === roomNumber.trim() && acknowledged && !blocked;

  const reset = () => {
    setOpen(false);
    setConfirmNumber("");
    setAcknowledged(false);
  };

  return (
    <>
      <div className="flex justify-end pt-1">
        <button
          type="button"
          disabled={saving}
          onClick={() => setOpen(true)}
          className="min-h-10 rounded-lg px-2 text-xs font-medium text-red-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.roomLifecycle.moveOutOpen")}
        </button>
      </div>

      {open ? (
        <SettingsSectionModalShell
          title={t("owner.roomLifecycle.moveOutTitle")}
          subtitle={t("owner.roomLifecycle.moveOutDesc")}
          onClose={reset}
          saving={saving}
          saveDisabled={!canConfirm || saving || blocked}
          saveLabel={t("owner.roomLifecycle.moveOutConfirm")}
          onSave={() => {
            void onMoveOut().then(() => reset());
          }}
        >
          <div className="space-y-4">
            {blockKey ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {t(blockKey)}
              </p>
            ) : (
              <>
                <p className="text-sm text-zinc-600">
                  {t("owner.roomLifecycle.moveOutHint")}
                </p>
                <input
                  value={confirmNumber}
                  onChange={(event) => setConfirmNumber(event.target.value)}
                  placeholder={roomNumber}
                  className={inputClass}
                />
                <label className="flex items-start gap-3 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300"
                  />
                  <span>{t("owner.roomLifecycle.moveOutAck")}</span>
                </label>
              </>
            )}

            {errorKey ? (
              <p className="text-sm text-red-700">{t(errorKey)}</p>
            ) : null}
          </div>
        </SettingsSectionModalShell>
      ) : null}
    </>
  );
}
