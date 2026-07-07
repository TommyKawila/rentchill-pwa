"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface PdpaConsentSkinProps {
  tenantName: string;
  disabled?: boolean;
  onAccept: () => void;
}

export function PdpaConsentSkin({
  tenantName,
  disabled,
  onAccept,
}: PdpaConsentSkinProps) {
  const { t } = useLocale();
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex justify-end">
        <LocaleToggleSkin />
      </div>
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          {t("tenant.pdpa.tag")}
        </p>
        <h1 className="mt-2 text-lg font-semibold">{t("tenant.pdpa.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {t("tenant.pdpa.desc", { name: tenantName })}
        </p>
      </header>

      <label className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-4 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1"
        />
        <span>{t("tenant.pdpa.checkbox")}</span>
      </label>

      <button
        type="button"
        disabled={disabled || !checked}
        onClick={onAccept}
        className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {disabled ? t("tenant.pdpa.saving") : t("tenant.pdpa.accept")}
      </button>
    </div>
  );
}
