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
    <section className="border-t border-zinc-200 bg-white px-4 py-4">
      <h2 className="text-sm font-semibold text-zinc-900">
        {t("tenant.history.title")}
      </h2>
      <ul className="mt-3 space-y-2">
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <button
              type="button"
              onClick={() => onSelect(invoice)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                selectedMonth === invoice.billing_month
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{invoice.billing_month}</span>
                <span className="text-xs text-zinc-500">
                  {t(statusMessageKey(invoice.status))}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">
                ฿{invoice.total_amount.toLocaleString("th-TH")}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
