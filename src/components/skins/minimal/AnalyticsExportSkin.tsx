"use client";

import { FileSpreadsheet, Lock, Printer } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface AnalyticsExportSkinProps {
  disabled?: boolean;
  exporting?: boolean;
  locked?: boolean;
  upgradeHref?: string;
  onExportExcel: () => void;
  onPrint: () => void;
}

export function AnalyticsExportSkin({
  disabled,
  exporting,
  locked,
  upgradeHref = "/billing?plan=growth",
  onExportExcel,
  onPrint,
}: AnalyticsExportSkinProps) {
  const { t } = useLocale();

  if (locked) {
    return (
      <section className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {t("owner.upgrade.gate.analyticsExport")}
            </p>
            <a
              href={upgradeHref}
              className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-rc-green px-4 text-sm font-medium text-white hover:bg-rc-green-dark"
            >
              {t("owner.upgrade.cta")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        disabled={disabled || exporting}
        onClick={onExportExcel}
        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:opacity-50"
      >
        <FileSpreadsheet className="h-5 w-5" strokeWidth={1.5} />
        {exporting ? t("owner.analytics.export.exporting") : t("owner.analytics.export.excel")}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onPrint}
        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900 disabled:opacity-50"
      >
        <Printer className="h-5 w-5" strokeWidth={1.5} />
        {t("owner.analytics.export.print")}
      </button>
    </section>
  );
}
