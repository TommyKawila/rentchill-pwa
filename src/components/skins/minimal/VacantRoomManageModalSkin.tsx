"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import type { AssignVacantTenantInput } from "@/hooks/useRoomLifecycle";
import type { MessageKey } from "@/services/i18n/messages";
import type { VacantRoomRow } from "@/services/vacantRoomService";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

type View = "menu" | "add" | "delete";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface VacantRoomManageModalSkinProps {
  room: VacantRoomRow;
  roomLimit: number;
  roomsRemaining: number;
  assignSaving: boolean;
  deleteSaving: boolean;
  assignError?: string | null;
  assignErrorKey?: MessageKey | null;
  deleteErrorKey?: MessageKey | null;
  onClose: () => void;
  onAssign: (input: AssignVacantTenantInput) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function VacantRoomManageModalSkin({
  room,
  roomLimit,
  roomsRemaining,
  assignSaving,
  deleteSaving,
  assignError,
  assignErrorKey,
  deleteErrorKey,
  onClose,
  onAssign,
  onDelete,
}: VacantRoomManageModalSkinProps) {
  const { t } = useLocale();
  const [view, setView] = useState<View>("menu");
  const [step, setStep] = useState<1 | 2>(1);
  const [rent, setRent] = useState(String(room.base_rent_price));
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [moveInDate, setMoveInDate] = useState(todayIso());
  const [waterReading, setWaterReading] = useState("");
  const [electricReading, setElectricReading] = useState("");
  const [confirmNumber, setConfirmNumber] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    setView("menu");
    setStep(1);
    setRent(String(room.base_rent_price));
    setTenantName("");
    setPhone("");
    setMoveInDate(todayIso());
    setWaterReading("");
    setElectricReading("");
    setConfirmNumber("");
    setAcknowledged(false);
  }, [room.room_id, room.base_rent_price]);

  const stepOneValid = tenantName.trim() && phone.trim();
  const stepTwoValid =
    moveInDate.trim() &&
    waterReading.trim() !== "" &&
    electricReading.trim() !== "" &&
    Number(waterReading) >= 0 &&
    Number(electricReading) >= 0;
  const canDelete =
    confirmNumber.trim() === room.room_number.trim() && acknowledged;

  const saving = assignSaving || deleteSaving;

  if (view === "menu") {
    return (
      <SettingsSectionModalShell
        title={t("owner.roomLifecycle.vacantManage")}
        subtitle={t("owner.roomLifecycle.vacantManageDesc", { room: room.room_number })}
        onClose={onClose}
      >
        <div className="space-y-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => setView("add")}
            className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.roomLifecycle.addTenantToRoom")}
          </button>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => setView("delete")}
              className="min-h-10 rounded-lg px-2 text-xs font-medium text-red-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("owner.roomLifecycle.deleteRoomSecondary")}
            </button>
          </div>
        </div>
      </SettingsSectionModalShell>
    );
  }

  if (view === "delete") {
    return (
      <SettingsSectionModalShell
        title={t("owner.roomLifecycle.deleteTitle", { room: room.room_number })}
        subtitle={t("owner.roomLifecycle.deleteDesc")}
        onClose={() => setView("menu")}
        saving={deleteSaving}
        saveDisabled={!canDelete || deleteSaving}
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
          {deleteErrorKey ? (
            <p className="text-sm text-red-600">{t(deleteErrorKey)}</p>
          ) : null}
        </div>
      </SettingsSectionModalShell>
    );
  }

  return (
    <SettingsSectionModalShell
      title={t("owner.roomLifecycle.addTenantToRoom")}
      subtitle={t("owner.roomLifecycle.addTenantToRoomDesc", { room: room.room_number })}
      onClose={() => {
        if (step === 2) {
          setStep(1);
          return;
        }
        setView("menu");
      }}
      saving={assignSaving}
      saveDisabled={
        step === 1 ? !stepOneValid || assignSaving : !stepTwoValid || assignSaving
      }
      saveLabel={
        step === 1
          ? t("owner.onboarding.nextStep")
          : t("owner.roomLifecycle.addTenantSubmit")
      }
      onSave={() => {
        if (step === 1) {
          setStep(2);
          return;
        }
        void onAssign({
          tenant_name: tenantName.trim(),
          phone_number: phone.trim(),
          base_rent_price: Number(rent || room.base_rent_price),
          move_in_date: moveInDate,
          water_reading: Number(waterReading),
          electric_reading: Number(electricReading),
        });
      }}
    >
      {step === 1 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm text-zinc-500 sm:col-span-2">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.roomNumber")}</span>
            <input value={room.room_number} readOnly className={`${inputClass} bg-zinc-50`} />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.rent")}</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={rent}
              onChange={(event) => setRent(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500 sm:col-span-2">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.tenantName")}</span>
            <input
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
              placeholder={t("owner.onboarding.tenantPlaceholder")}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500 sm:col-span-2">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.phone")}</span>
            <input
              value={phone}
              inputMode="numeric"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0812345678"
              className={inputClass}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.moveInDate")}</span>
            <input
              type="date"
              value={moveInDate}
              onChange={(event) => setMoveInDate(event.target.value)}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">{t("owner.onboarding.waterBaseline")}</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={waterReading}
                onChange={(event) => setWaterReading(event.target.value)}
                placeholder="1245"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">{t("owner.onboarding.electricBaseline")}</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={electricReading}
                onChange={(event) => setElectricReading(event.target.value)}
                placeholder="8902"
                className={inputClass}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-500">{t("owner.onboarding.meterBaselineHint")}</p>
        </div>
      )}

      {assignErrorKey ? (
        <p className="mt-3 text-sm text-red-600">{t(assignErrorKey)}</p>
      ) : assignError ? (
        <p className="mt-3 text-sm text-red-600">{assignError}</p>
      ) : null}
    </SettingsSectionModalShell>
  );
}
