"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface PdpaConsentSkinProps {
  tenantName: string;
  disabled?: boolean;
  onAccept: () => void;
}

const DATA_ITEMS = [
  "tenant.pdpa.item.name",
  "tenant.pdpa.item.line",
  "tenant.pdpa.item.slip",
  "tenant.pdpa.item.billing",
] as const;

export function PdpaConsentSkin({
  tenantName,
  disabled,
  onAccept,
}: PdpaConsentSkinProps) {
  const { t } = useLocale();
  const [consentChecked, setConsentChecked] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const canAccept = consentChecked && policyChecked;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex justify-end">
        <LocaleToggleSkin />
      </div>
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-rc-green">
          {t("tenant.pdpa.tag")}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">{t("tenant.pdpa.title")}</h1>
        <p className="mt-2 text-base text-zinc-600">
          {t("tenant.pdpa.desc", { name: tenantName })}
        </p>
      </header>

      <ul className="space-y-2 rounded-xl border border-zinc-100 bg-white p-4 text-sm text-zinc-600">
        {DATA_ITEMS.map((key) => (
          <li key={key} className="flex gap-2">
            <span className="text-rc-green">·</span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/privacy" className="text-rc-green-ink underline">
          {t("tenant.pdpa.privacyLink")}
        </Link>
        <Link href="/contact" className="text-rc-green-ink underline">
          {t("tenant.pdpa.contactLink")}
        </Link>
      </div>

      <label className="flex min-h-12 items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 text-base">
        <input
          type="checkbox"
          checked={policyChecked}
          onChange={(event) => setPolicyChecked(event.target.checked)}
          className="mt-1 h-5 w-5 shrink-0"
        />
        <span>{t("tenant.pdpa.readPolicy")}</span>
      </label>

      <label className="flex min-h-12 items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 text-base">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(event) => setConsentChecked(event.target.checked)}
          className="mt-1 h-5 w-5 shrink-0"
        />
        <span>{t("tenant.pdpa.checkbox")}</span>
      </label>

      <button
        type="button"
        disabled={disabled || !canAccept}
        onClick={onAccept}
        className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? t("tenant.pdpa.saving") : t("tenant.pdpa.accept")}
      </button>
    </div>
  );
}
