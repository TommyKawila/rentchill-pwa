"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { AddRoomTenantForm } from "@/hooks/useAddRoomTenant";
import { TENANT_TITLE_OPTIONS } from "@/services/tenantTitleUtils";

interface EmptyProjectOnboardingSkinProps {
  propertySlug: string;
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  variant?: "first" | "additional";
  formKey?: string;
  onCancel?: () => void;
  onSubmit: (form: AddRoomTenantForm) => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function AddRoomForm({
  disabled,
  saving,
  error,
  variant = "first",
  onCancel,
  onSubmit,
}: EmptyProjectOnboardingSkinProps) {
  const { t } = useLocale();
  const [step, setStep] = useState<1 | 2>(1);
  const [roomNumber, setRoomNumber] = useState("");
  const [rent, setRent] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [moveInDate, setMoveInDate] = useState(todayIso());
  const [waterReading, setWaterReading] = useState("");
  const [electricReading, setElectricReading] = useState("");
  const isAdditional = variant === "additional";

  const stepOneValid =
    titlePrefix.trim() && roomNumber.trim() && tenantName.trim() && phone.trim();
  const stepTwoValid =
    moveInDate.trim() &&
    waterReading.trim() !== "" &&
    electricReading.trim() !== "" &&
    Number(waterReading) >= 0 &&
    Number(electricReading) >= 0;

  const handleSubmit = () => {
    onSubmit({
      room_number: roomNumber.trim(),
      base_rent_price: Number(rent || 0),
      tenant_name: tenantName.trim(),
      title_prefix: titlePrefix.trim(),
      phone_number: phone.trim(),
      move_in_date: moveInDate,
      water_reading: Number(waterReading),
      electric_reading: Number(electricReading),
    });
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            {step === 1
              ? t(isAdditional ? "owner.rooms.addRoomTitle" : "owner.onboarding.title")
              : t("owner.onboarding.meterStepTitle")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
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
            className="shrink-0 text-sm text-zinc-500 underline disabled:opacity-50"
          >
            {t("owner.rooms.close")}
          </button>
        )}
      </div>

      {step === 1 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("owner.onboarding.roomNumber")}</span>
            <input
              value={roomNumber}
              inputMode="numeric"
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="101"
              className="w-full rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("owner.onboarding.rent")}</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="5000"
              className="w-full rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("owner.onboarding.titlePrefix")}</span>
            <select
              value={titlePrefix}
              onChange={(e) => setTitlePrefix(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            >
              <option value="">{t("owner.onboarding.titlePrefixChoose")}</option>
              {TENANT_TITLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm sm:col-span-2">
            <span className="font-medium">{t("owner.onboarding.tenantName")}</span>
            <input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder={t("owner.onboarding.tenantPlaceholder")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("owner.onboarding.phone")}</span>
            <input
              value={phone}
              inputMode="numeric"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812345678"
              className="w-full rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("owner.onboarding.moveInDate")}</span>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-medium">{t("owner.onboarding.waterBaseline")}</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={waterReading}
                onChange={(e) => setWaterReading(e.target.value)}
                placeholder="1245"
                className="w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">{t("owner.onboarding.electricBaseline")}</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={electricReading}
                onChange={(e) => setElectricReading(e.target.value)}
                placeholder="8902"
                className="w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </label>
          </div>
          <p className="text-xs text-zinc-500">{t("owner.onboarding.meterBaselineHint")}</p>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      {step === 1 ? (
        <button
          type="button"
          disabled={disabled || saving || !stepOneValid}
          onClick={() => setStep(2)}
          className="mt-4 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.onboarding.nextStep")}
        </button>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => setStep(1)}
            className="flex-1 rounded-md border border-zinc-300 py-2.5 text-sm"
          >
            {t("owner.onboarding.backStep")}
          </button>
          <button
            type="button"
            disabled={disabled || saving || !stepTwoValid}
            onClick={handleSubmit}
            className="flex-1 rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t("owner.onboarding.saving") : t("owner.onboarding.submit")}
          </button>
        </div>
      )}

      {!isAdditional && step === 1 && (
        <a
          href="/import"
          className="mt-3 block text-center text-xs text-zinc-500 underline"
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
