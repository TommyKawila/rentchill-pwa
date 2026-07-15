"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/services/i18n/messages";

export function LocaleToggleSkin() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex rounded-full border border-zinc-300 bg-white p-0.5 text-sm">
      {(["th", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={
            locale === code
              ? "inline-flex min-h-12 items-center rounded-full bg-rc-green px-3 font-medium text-white"
              : "inline-flex min-h-12 items-center rounded-full px-3 font-medium text-zinc-600"
          }
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
