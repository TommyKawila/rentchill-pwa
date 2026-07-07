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
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          {t("tenant.invite.tag")}
        </p>
        <h1 className="mt-2 text-lg font-semibold">{t("tenant.invite.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t("tenant.invite.desc")}</p>
      </header>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">{t("tenant.invite.code")}</span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="RCDEMO1"
          className="w-full rounded-md border border-zinc-200 px-3 py-2 uppercase"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={disabled || !code.trim()}
        onClick={() => onSubmit(code.trim())}
        className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {disabled ? t("tenant.invite.linking") : t("tenant.invite.submit")}
      </button>
    </div>
  );
}
