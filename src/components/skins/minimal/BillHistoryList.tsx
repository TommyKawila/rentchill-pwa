"use client";

import { useLocale } from "@/components/LocaleProvider";
import { statusMessageKey } from "@/services/i18n/translate";
import type { Invoice } from "@/services/types";

interface BillHistoryListProps {
  invoices: Invoice[];
  selectedMonth: string | null;
  onSelect: (invoice: Invoice) => void;
}

export function BillHistoryList({
  invoices,
  selectedMonth,
  onSelect,
}: BillHistoryListProps) {
  const { t } = useLocale();

  if (invoices.length === 0) return null;

  return (
    <section className="border-t border-zinc-100 bg-white px-6 py-4">
      <h2 className="text-base font-semibold text-zinc-900">
        {t("tenant.history.title")}
      </h2>
      <ul className="mt-3 space-y-3">
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <button
              type="button"
              onClick={() => onSelect(invoice)}
              className={`flex min-h-12 w-full flex-col justify-center rounded-lg border px-4 py-3 text-left ${
                selectedMonth === invoice.billing_month
                  ? "border-rc-green bg-rc-green-soft"
                  : "border-zinc-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-bold">{invoice.billing_month}</span>
                <span className="text-sm text-zinc-500">
                  {t(statusMessageKey(invoice.status))}
                </span>
              </div>
              <p className="mt-1 text-base font-bold text-zinc-900">
                ฿{invoice.total_amount.toLocaleString("th-TH")}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
