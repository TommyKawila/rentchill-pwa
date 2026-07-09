"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { AddRoomTenantForm } from "@/hooks/useAddRoomTenant";

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
  const [roomNumber, setRoomNumber] = useState("");
  const [rent, setRent] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const isAdditional = variant === "additional";

  const handleSubmit = () => {
    onSubmit({
      room_number: roomNumber.trim(),
      base_rent_price: Number(rent || 0),
      tenant_name: tenantName.trim(),
      phone_number: phone.trim(),
    });
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            {t(isAdditional ? "owner.rooms.addRoomTitle" : "owner.onboarding.title")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {t(isAdditional ? "owner.rooms.addRoomDesc" : "owner.onboarding.desc")}
          </p>
        </div>
        {isAdditional && onCancel && (
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

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      <button
        type="button"
        disabled={
          disabled || saving || !roomNumber.trim() || !tenantName.trim() || !phone.trim()
        }
        onClick={handleSubmit}
        className="mt-4 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? t("owner.onboarding.saving") : t("owner.onboarding.submit")}
      </button>

      {!isAdditional && (
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
