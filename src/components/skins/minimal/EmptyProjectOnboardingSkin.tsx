"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { AddRoomTenantForm } from "@/hooks/useAddRoomTenant";

interface EmptyProjectOnboardingSkinProps {
  propertySlug: string;
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  onSubmit: (form: AddRoomTenantForm) => void;
}

export function EmptyProjectOnboardingSkin({
  propertySlug,
  disabled,
  saving,
  error,
  onSubmit,
}: EmptyProjectOnboardingSkinProps) {
  const { t } = useLocale();
  const [roomNumber, setRoomNumber] = useState("");
  const [rent, setRent] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");

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
      <h3 className="text-sm font-semibold text-zinc-900">
        {t("owner.onboarding.title")}
      </h3>
      <p className="mt-1 text-xs text-zinc-500">{t("owner.onboarding.desc")}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t("owner.onboarding.roomNumber")}</span>
          <input
            value={roomNumber}
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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812345678"
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-700">{error}</p>
      )}

      <button
        type="button"
        disabled={disabled || saving || !roomNumber.trim() || !tenantName.trim() || !phone.trim()}
        onClick={handleSubmit}
        className="mt-4 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? t("owner.onboarding.saving") : t("owner.onboarding.submit")}
      </button>

      <a
        href="/import"
        className="mt-3 block text-center text-xs text-zinc-500 underline"
      >
        {t("owner.onboarding.importLink")}
      </a>
    </div>
  );
}
