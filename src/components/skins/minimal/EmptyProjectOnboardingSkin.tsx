"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { AddRoomForm } from "@/hooks/useAddRoomTenant";

interface EmptyProjectOnboardingSkinProps {
  propertySlug: string;
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  variant?: "first" | "additional";
  formKey?: string;
  onCancel?: () => void;
  onSubmit: (form: AddRoomForm) => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base text-zinc-900";

function AddRoomForm({
  propertySlug,
  disabled,
  saving,
  error,
  variant = "first",
  onCancel,
  onSubmit,
}: EmptyProjectOnboardingSkinProps) {
  const { t } = useLocale();
  const [addMode, setAddMode] = useState<"tenant" | "vacant">("vacant");
  const [step, setStep] = useState<1 | 2>(1);
  const [roomNumber, setRoomNumber] = useState("");
  const [rent, setRent] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [moveInDate, setMoveInDate] = useState(todayIso());
  const [waterReading, setWaterReading] = useState("");
  const [electricReading, setElectricReading] = useState("");
  const isAdditional = variant === "additional";

  const stepOneValid =
    roomNumber.trim() &&
    (addMode === "vacant" || (tenantName.trim() && phone.trim()));
  const stepTwoValid =
    moveInDate.trim() &&
    waterReading.trim() !== "" &&
    electricReading.trim() !== "" &&
    Number(waterReading) >= 0 &&
    Number(electricReading) >= 0;

  const handleSubmit = () => {
    if (addMode === "vacant") {
      onSubmit({
        mode: "vacant",
        room_number: roomNumber.trim(),
        base_rent_price: Number(rent || 0),
      });
      return;
    }

    onSubmit({
      mode: "tenant",
      room_number: roomNumber.trim(),
      base_rent_price: Number(rent || 0),
      tenant_name: tenantName.trim(),
      phone_number: phone.trim(),
      move_in_date: moveInDate,
      water_reading: Number(waterReading),
      electric_reading: Number(electricReading),
    });
  };

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">
            {step === 1
              ? t(isAdditional ? "owner.rooms.addRoomTitle" : "owner.onboarding.title")
              : t("owner.onboarding.meterStepTitle")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {step === 1
              ? t(isAdditional ? "owner.rooms.addRoomDesc" : "owner.onboarding.desc")
              : t("owner.onboarding.meterStepDesc")}
          </p>
        </div>
        {isAdditional && onCancel && step === 1 && (
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="inline-flex min-h-12 shrink-0 items-center text-base text-zinc-500 underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.rooms.close")}
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {(["vacant", "tenant"] as const).map((mode) => {
          const active = addMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setAddMode(mode);
                setStep(1);
              }}
              className={`min-h-12 flex-1 rounded-lg border px-3 text-sm font-medium ${
                active
                  ? "border-rc-green bg-rc-green text-white"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {mode === "vacant"
                ? t("owner.rooms.addModeVacant")
                : t("owner.rooms.addModeTenant")}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        {addMode === "vacant"
          ? t("owner.rooms.addModeVacantDesc")
          : t("owner.rooms.addModeTenantDesc")}
      </p>

      {step === 1 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.roomNumber")}</span>
            <input
              value={roomNumber}
              inputMode="numeric"
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="101"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.rent")}</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="5000"
              className={inputClass}
            />
          </label>
          {addMode === "tenant" ? (
            <>
              <label className="block space-y-1 text-sm text-zinc-500 sm:col-span-2">
                <span className="font-medium text-zinc-900">{t("owner.onboarding.tenantName")}</span>
                <input
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder={t("owner.onboarding.tenantPlaceholder")}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">{t("owner.onboarding.phone")}</span>
                <input
                  value={phone}
                  inputMode="numeric"
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812345678"
                  className={inputClass}
                />
              </label>
            </>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("owner.onboarding.moveInDate")}</span>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
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
                onChange={(e) => setWaterReading(e.target.value)}
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
                onChange={(e) => setElectricReading(e.target.value)}
                placeholder="8902"
                className={inputClass}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-500">{t("owner.onboarding.meterBaselineHint")}</p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {step === 1 ? (
        addMode === "vacant" ? (
          <button
            type="button"
            disabled={disabled || saving || !stepOneValid}
            onClick={handleSubmit}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t("owner.onboarding.saving") : t("owner.rooms.addVacantSubmit")}
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled || saving || !stepOneValid}
            onClick={() => setStep(2)}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.onboarding.nextStep")}
          </button>
        )
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => setStep(1)}
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-200 text-base text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.onboarding.backStep")}
          </button>
          <button
            type="button"
            disabled={disabled || saving || !stepTwoValid}
            onClick={handleSubmit}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t("owner.onboarding.saving") : t("owner.onboarding.submit")}
          </button>
        </div>
      )}

      {!isAdditional && step === 1 && (
        <a
          href={`/import?property=${encodeURIComponent(propertySlug)}`}
          className="mt-3 flex min-h-12 items-center justify-center text-center text-base text-zinc-500 underline"
        >
          {t("owner.onboarding.importLink")}
        </a>
      )}
    </div>
  );
}

export function EmptyProjectOnboardingSkin(props: EmptyProjectOnboardingSkinProps) {
  return <AddRoomForm key={props.formKey ?? "default"} {...props} />;
}
