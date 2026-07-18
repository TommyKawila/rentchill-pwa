"use client";

import { useLocale } from "@/components/LocaleProvider";
import { statusMessageKey } from "@/services/i18n/translate";
import type { Invoice } from "@/services/types";

function statusTone(status: Invoice["status"]) {
  if (status === "paid") return "bg-rc-success-soft text-rc-success-ink";
  if (status === "scanning") return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-700";
}

interface RoomInvoiceHistorySkinProps {
  invoices: Invoice[];
  loading?: boolean;
  error?: string | null;
}

export function RoomInvoiceHistorySkin({
  invoices,
  loading,
  error,
}: RoomInvoiceHistorySkinProps) {
  const { t } = useLocale();

  if (loading) {
    return <p className="text-sm text-zinc-500">{t("common.loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (invoices.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-500">
        {t("owner.invoiceHistory.empty")}
      </p>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-500">
        {t("owner.invoiceHistory.title")}
      </h3>
      <ul className="space-y-2">
        {invoices.map((invoice) => (
          <li
            key={invoice.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-base font-bold text-zinc-900">
                {invoice.billing_month}
              </p>
              <p className="text-base font-bold tabular-nums text-zinc-900">
                ฿{invoice.total_amount.toLocaleString("th-TH")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-lg px-2 py-1 text-sm font-medium ${statusTone(invoice.status)}`}
            >
              {t(statusMessageKey(invoice.status))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
