"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Invoice } from "@/services/types";
import { statusMessageKey } from "@/services/i18n/translate";

interface InvoiceSkinProps {
  invoice: Invoice;
  tenantName: string;
  roomNumber: string;
  isPaying?: boolean;
  onPay: () => void;
}

const formatAmount = (amount: number) =>
  amount.toLocaleString("th-TH", { minimumFractionDigits: 0 });

export function InvoiceSkin({
  invoice,
  tenantName,
  roomNumber,
  isPaying,
  onPay,
}: InvoiceSkinProps) {
  const { t } = useLocale();
  const canPay = invoice.status === "pending" && !isPaying;
  const hasRejection = Boolean(invoice.slip_rejection_note?.trim());

  return (
    <article className="bg-zinc-50 p-6 text-zinc-900">
      <header className="border-b border-zinc-200 pb-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {t("tenant.invoice.tag")}
        </p>
        <h1 className="mt-1 text-lg font-semibold">{tenantName}</h1>
        <p className="text-sm text-zinc-600">
          {t("common.room", { number: roomNumber })} · {invoice.billing_month}
        </p>
        <span className="mt-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
          {t(statusMessageKey(invoice.status))}
        </span>
      </header>

      <section className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600">{t("tenant.invoice.rent")}</span>
          <span className="font-medium">
            ฿{formatAmount(invoice.base_rent_amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">
            {t("tenant.invoice.water", { units: invoice.water_unit })}
          </span>
          <span className="font-medium">
            ฿{formatAmount(invoice.water_amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">
            {t("tenant.invoice.electric", { units: invoice.electric_unit })}
          </span>
          <span className="font-medium">
            ฿{formatAmount(invoice.electric_amount)}
          </span>
        </div>
      </section>

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <div className="flex justify-between text-base font-bold">
          <span>{t("tenant.invoice.total")}</span>
          <span>฿{formatAmount(invoice.total_amount)}</span>
        </div>
      </div>

      {invoice.status === "scanning" && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("tenant.invoice.scanning")}
        </div>
      )}

      {hasRejection && invoice.status === "pending" && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-medium">{t("tenant.invoice.rejected")}</p>
          <p className="mt-1">{invoice.slip_rejection_note}</p>
        </div>
      )}

      {invoice.status === "paid" && (
        <div className="mt-4 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
          {t("tenant.invoice.paidNote")}
        </div>
      )}

      <footer className="mt-6 flex flex-col items-center gap-4">
        {invoice.slip_image_url && !(hasRejection && invoice.status === "pending") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={invoice.slip_image_url}
            alt={t("tenant.invoice.slipAlt")}
            className="h-28 w-28 rounded-md border border-zinc-200 object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-28 w-28 items-center justify-center border border-dashed border-zinc-300 bg-white text-xs text-zinc-400"
          >
            {t("tenant.invoice.qrPlaceholder")}
          </div>
        )}
        <button
          type="button"
          onClick={onPay}
          disabled={!canPay}
          className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPaying
            ? t("tenant.invoice.uploading")
            : invoice.status === "pending"
              ? hasRejection
                ? t("tenant.invoice.resubmit")
                : t("tenant.invoice.pay")
              : invoice.status === "scanning"
                ? t("tenant.invoice.waitReview")
                : t("tenant.invoice.paid")}
        </button>
      </footer>
    </article>
  );
}
