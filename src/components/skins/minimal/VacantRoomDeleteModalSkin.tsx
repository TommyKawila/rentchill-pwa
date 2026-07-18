"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import type { MessageKey } from "@/services/i18n/messages";
import type { VacantRoomRow } from "@/services/vacantRoomService";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface VacantRoomDeleteModalSkinProps {
  room: VacantRoomRow;
  roomLimit: number;
  roomsRemaining: number;
  saving: boolean;
  errorKey?: MessageKey | null;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export function VacantRoomDeleteModalSkin({
  room,
  roomLimit,
  roomsRemaining,
  saving,
  errorKey,
  onClose,
  onDelete,
}: VacantRoomDeleteModalSkinProps) {
  const { t } = useLocale();
  const [confirmNumber, setConfirmNumber] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    setConfirmNumber("");
    setAcknowledged(false);
  }, [room.room_id]);

  const canConfirm =
    confirmNumber.trim() === room.room_number.trim() && acknowledged;

  return (
    <SettingsSectionModalShell
      title={t("owner.roomLifecycle.deleteTitle", { room: room.room_number })}
      subtitle={t("owner.roomLifecycle.deleteDesc")}
      onClose={onClose}
      saving={saving}
      saveDisabled={!canConfirm || saving}
      saveLabel={t("owner.roomLifecycle.deleteConfirm")}
      onSave={() => void onDelete().then(() => onClose())}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-rc-green/30 bg-rc-green-soft px-4 py-3 text-sm text-rc-green-ink">
          {t("owner.roomLifecycle.deleteQuota", {
            remaining: String(Math.min(roomLimit, roomsRemaining + 1)),
            limit: String(roomLimit),
          })}
        </div>

        <p className="text-sm text-zinc-600">{t("owner.roomLifecycle.deleteHint")}</p>

        <input
          value={confirmNumber}
          onChange={(event) => setConfirmNumber(event.target.value)}
          placeholder={room.room_number}
          className={inputClass}
        />

        <label className="flex items-start gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300"
          />
          <span>{t("owner.roomLifecycle.deleteAck")}</span>
        </label>

        {errorKey ? <p className="text-sm text-red-600">{t(errorKey)}</p> : null}
      </div>
    </SettingsSectionModalShell>
  );
}
