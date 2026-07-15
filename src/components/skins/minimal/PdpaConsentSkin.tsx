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
        <p className="text-sm font-medium uppercase tracking-wide text-green-600">
          {t("tenant.pdpa.tag")}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">{t("tenant.pdpa.title")}</h1>
        <p className="mt-2 text-base text-zinc-600">
          {t("tenant.pdpa.desc", { name: tenantName })}
        </p>
      </header>

      <label className="flex min-h-12 items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 text-base">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1 h-5 w-5 shrink-0"
        />
        <span>{t("tenant.pdpa.checkbox")}</span>
      </label>

      <button
        type="button"
        disabled={disabled || !checked}
        onClick={onAccept}
        className="flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? t("tenant.pdpa.saving") : t("tenant.pdpa.accept")}
      </button>
    </div>
  );
}
