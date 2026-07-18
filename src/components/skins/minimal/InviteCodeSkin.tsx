"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface InviteCodeSkinProps {
  initialCode?: string;
  disabled?: boolean;
  error?: string | null;
  onSubmit: (code: string) => void;
}

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base uppercase text-zinc-900";

export function InviteCodeSkin({
  initialCode = "",
  disabled,
  error,
  onSubmit,
}: InviteCodeSkinProps) {
  const { t } = useLocale();
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex justify-end">
        <LocaleToggleSkin />
      </div>
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-rc-green">
          {t("tenant.invite.tag")}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">{t("tenant.invite.title")}</h1>
        <p className="mt-2 text-base text-zinc-600">{t("tenant.invite.desc")}</p>
      </header>

      <label className="block space-y-1 text-sm text-zinc-500">
        <span className="font-medium text-zinc-900">{t("tenant.invite.code")}</span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="RCDEMO1"
          inputMode="text"
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={disabled || !code.trim()}
        onClick={() => onSubmit(code.trim())}
        className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? t("tenant.invite.linking") : t("tenant.invite.submit")}
      </button>
    </div>
  );
}
