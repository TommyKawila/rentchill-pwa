"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import type { BillingMonthDisplayFormat } from "@/services/billingMonthDisplayService";
import { formatBillingMonth } from "@/services/billingMonthDisplayService";

interface BillingMonthFormatSkinProps {
  format: BillingMonthDisplayFormat;
  onChange: (format: BillingMonthDisplayFormat) => void;
}

const FORMATS: BillingMonthDisplayFormat[] = ["thaiBe", "thaiCe", "iso"];

const FORMAT_LABEL_KEYS: Record<BillingMonthDisplayFormat, MessageKey> = {
  thaiBe: "settings.monthFormat.thaiBe",
  thaiCe: "settings.monthFormat.thaiCe",
  iso: "settings.monthFormat.iso",
};

const SAMPLE_ISO = "2026-07";

export function BillingMonthFormatSkin({
  format,
  onChange,
}: BillingMonthFormatSkinProps) {
  const { t, locale } = useLocale();

  return (
    <div className="space-y-3">
      {FORMATS.map((key) => {
        const active = format === key;
        const sample = formatBillingMonth(SAMPLE_ISO, key, locale);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-base transition-colors ${
              active
                ? "border-rc-green bg-rc-green text-white"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"
            }`}
          >
            <span className="font-medium">{t(FORMAT_LABEL_KEYS[key])}</span>
            <span className={`text-sm ${active ? "text-white/80" : "text-zinc-500"}`}>
              {sample}
            </span>
          </button>
        );
      })}
    </div>
  );
}
