"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { TENANT_TITLE_OPTIONS } from "@/services/tenantTitleUtils";

interface TenantProfileEditorSkinProps {
  titlePrefix: string | null;
  tenantName: string;
  saving?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSave: (input: { title_prefix: string; tenant_name: string }) => void;
}

export function TenantProfileEditorSkin({
  titlePrefix,
  tenantName,
  saving,
  error,
  onCancel,
  onSave,
}: TenantProfileEditorSkinProps) {
  const { t } = useLocale();
  const [prefix, setPrefix] = useState(titlePrefix ?? "");
  const [name, setName] = useState(tenantName);

  useEffect(() => {
    setPrefix(titlePrefix ?? "");
    setName(tenantName);
  }, [titlePrefix, tenantName]);

  const valid = prefix.trim() && name.trim();

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="font-medium tracking-tight text-zinc-900">
        {t("owner.tenant.editTitle")}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-medium text-zinc-700">
            {t("owner.onboarding.titlePrefix")}
          </span>
          <select
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            disabled={saving}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 disabled:opacity-50"
          >
            <option value="">{t("owner.onboarding.titlePrefixChoose")}</option>
            {TENANT_TITLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 sm:col-span-2">
          <span className="font-medium text-zinc-700">
            {t("owner.onboarding.tenantName")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            placeholder={t("owner.onboarding.tenantPlaceholder")}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 disabled:opacity-50"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.tenant.cancel")}
        </button>
        <button
          type="button"
          disabled={saving || !valid}
          onClick={() =>
            onSave({
              title_prefix: prefix.trim(),
              tenant_name: name.trim(),
            })
          }
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-zinc-900 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
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
      className="group inline-flex min-h-11 items-center gap-x-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-medium text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
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
