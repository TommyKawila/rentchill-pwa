"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/services/i18n/messages";

interface LocaleToggleSkinProps {
  compact?: boolean;
}

export function LocaleToggleSkin({ compact = false }: LocaleToggleSkinProps) {
  const { locale, setLocale } = useLocale();
  const btnClass = compact
    ? "inline-flex min-h-10 items-center rounded-full px-2.5 text-xs font-medium"
    : "inline-flex min-h-12 items-center rounded-full px-3 font-medium";

  return (
    <div
      className={`inline-flex rounded-full border border-zinc-300 bg-white p-0.5 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      {(["th", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={
            locale === code
              ? `${btnClass} bg-rc-green text-white`
              : `${btnClass} text-zinc-600`
          }
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
