"use client";

import { useLocale } from "@/components/LocaleProvider";

interface CsvExportSkinProps {
  billingMonth: string;
  disabled?: boolean;
  canExport?: boolean;
  quotaHint?: string | null;
  onExport: () => void;
}

export function CsvExportSkin({
  billingMonth,
  disabled,
  canExport,
  quotaHint,
  onExport,
}: CsvExportSkinProps) {
  const { t } = useLocale();

  return (
    <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-800">{t("owner.csv.title")}</h2>
      <p className="mt-1 text-xs text-zinc-500">
        {t("owner.csv.desc", { month: billingMonth })}
      </p>
      {quotaHint && (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {quotaHint}
        </p>
      )}
      <button
        type="button"
        disabled={disabled || !canExport}
        onClick={onExport}
        className="mt-3 w-full rounded-md border border-zinc-300 bg-zinc-50 py-2.5 text-sm font-medium text-zinc-800 disabled:opacity-50"
      >
        {t("owner.csv.export")}
      </button>
    </section>
  );
}
