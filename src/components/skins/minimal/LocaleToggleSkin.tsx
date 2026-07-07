"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/services/i18n/messages";

export function LocaleToggleSkin() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex rounded-full border border-zinc-300 bg-white p-0.5 text-xs">
      {(["th", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={
            locale === code
              ? "rounded-full bg-zinc-900 px-2.5 py-1 font-medium text-white"
              : "rounded-full px-2.5 py-1 font-medium text-zinc-600"
          }
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
