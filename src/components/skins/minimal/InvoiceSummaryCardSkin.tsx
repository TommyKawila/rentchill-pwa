"use client";

import { QrCode } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface InvoiceSummaryCardSkinProps {
  grandTotal: number;
  showQrToggle: boolean;
  includePromptPayQr: boolean;
  disabled?: boolean;
  onQrToggle: (value: boolean) => void;
}

export function InvoiceSummaryCardSkin({
  grandTotal,
  showQrToggle,
  includePromptPayQr,
  disabled,
  onQrToggle,
}: InvoiceSummaryCardSkinProps) {
  const { t } = useLocale();

  return (
    <section className="rounded-xl bg-rc-primary-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-medium text-rc-text">
          {t("owner.invoiceGen.netTotal")}
        </p>
        <p className="text-[28px] font-bold tabular-nums text-rc-primary">
          ฿{grandTotal.toLocaleString("th-TH")}
        </p>
      </div>

      {showQrToggle && (
        <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-rc-text">
            <QrCode className="h-4 w-4 shrink-0 text-rc-primary" aria-hidden />
            {t("owner.invoiceGen.qrToggleLong")}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={includePromptPayQr}
            disabled={disabled}
            onClick={() => onQrToggle(!includePromptPayQr)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              includePromptPayQr ? "bg-rc-green" : "bg-zinc-300"
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                includePromptPayQr ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      )}
    </section>
  );
}
