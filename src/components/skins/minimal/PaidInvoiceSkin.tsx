"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";

interface PaidInvoiceSkinProps {
  invoice: InvoiceOverrideRow;
}

export function PaidInvoiceSkin({ invoice }: PaidInvoiceSkinProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-xl border border-green-200 bg-green-50 p-6">
      <header className="border-b border-green-100 pb-3">
        <p className="text-base font-semibold">{invoice.tenant_name}</p>
        <p className="text-sm text-zinc-600">
          {t("common.room", { number: invoice.room_number })} · {invoice.billing_month} ·{" "}
          {t("status.paid")}
        </p>
      </header>

      <p className="mt-3 text-base font-bold">
        {t("common.total")} ฿{invoice.total_amount.toLocaleString("th-TH")}
      </p>

      {invoice.slip_image_url ? (
        <div className="mt-3">
          <p className="text-sm text-zinc-500">{t("owner.paidSlip")}</p>
          <a
            href={invoice.slip_image_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={invoice.slip_image_url}
              alt={t("tenant.invoice.slipAlt")}
              className="max-h-48 w-full rounded-lg border border-zinc-200 object-contain"
            />
          </a>
        </div>
      ) : invoice.owner_payment_proof_url ? (
        <div className="mt-3">
          <p className="text-sm text-zinc-500">{t("owner.paid.cashProofLabel")}</p>
          <a
            href={invoice.owner_payment_proof_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={invoice.owner_payment_proof_url}
              alt={t("owner.paid.cashProofLabel")}
              className="max-h-48 w-full rounded-lg border border-zinc-200 object-contain"
            />
          </a>
          {invoice.owner_payment_note?.trim() && (
            <p className="mt-2 text-sm text-zinc-600">{invoice.owner_payment_note}</p>
          )}
        </div>
      ) : invoice.owner_payment_note?.trim() ? (
        <p className="mt-3 text-sm text-zinc-600">{invoice.owner_payment_note}</p>
      ) : (
        <p className="mt-3 text-sm text-zinc-600">{t("owner.paid.cashNote")}</p>
      )}
    </article>
  );
}
