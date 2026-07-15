"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface TenantProfileEditorSkinProps {
  tenantName: string;
  saving?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSave: (input: { tenant_name: string }) => void;
}

export function TenantProfileEditorSkin({
  tenantName,
  saving,
  error,
  onCancel,
  onSave,
}: TenantProfileEditorSkinProps) {
  const { t } = useLocale();
  const [name, setName] = useState(tenantName);

  useEffect(() => {
    setName(tenantName);
  }, [tenantName]);

  const valid = name.trim();

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
      <p className="text-base font-medium tracking-tight text-zinc-900">
        {t("owner.tenant.editTitle")}
      </p>

      <label className="mt-3 block space-y-1 text-sm text-zinc-500">
        <span className="font-medium text-zinc-900">
          {t("owner.onboarding.tenantName")}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          placeholder={t("owner.onboarding.tenantPlaceholder")}
          className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.tenant.cancel")}
        </button>
        <button
          type="button"
          disabled={saving || !valid}
          onClick={() => onSave({ tenant_name: name.trim() })}
          className="flex min-h-14 flex-1 items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? t("owner.tenant.saving") : t("owner.tenant.save")}
        </button>
      </div>
    </div>
  );
}

export function TenantProfileEditButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group inline-flex min-h-12 items-center gap-x-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-base font-medium text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Pencil
        className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-zinc-900"
        strokeWidth={1.5}
        aria-hidden
      />
      {t("owner.tenant.edit")}
    </button>
  );
}
