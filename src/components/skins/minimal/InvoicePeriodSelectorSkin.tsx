"use client";

import { useLocale } from "@/components/LocaleProvider";

interface InvoicePeriodSelectorSkinProps {
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function InvoicePeriodSelectorSkin({
  value,
  options,
  disabled,
  onChange,
}: InvoicePeriodSelectorSkinProps) {
  const { t } = useLocale();

  return (
    <section className="space-y-2">
      <p className="text-sm font-bold text-rc-text">
        {t("owner.invoiceGen.periodLabel")}
      </p>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 text-base text-rc-text disabled:bg-zinc-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </section>
  );
}
